import os
import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Config ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MODEL_PATH = 'models/flood_model_xgboost.pkl'
ENCODER_PATH = 'models/label_encoder.pkl'

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing SUPABASE credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Load Model ---
try:
    model = joblib.load(MODEL_PATH)
    encoder = joblib.load(ENCODER_PATH)
    print(f"🧠 Loaded model from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit()

def get_latest_forecasts():
    """ดึงข้อมูลพยากรณ์ล่าสุด (3 วันข้างหน้า) ผูกกับข้อมูลเขต"""
    print("📥 Fetching forecasts & district info...")
    
    # 1. ดึง Forecasts (เฉพาะวันที่ยังไม่ผ่านไป)
    today = datetime.now().strftime('%Y-%m-%d')
    forecast_resp = supabase.table("rain_forecasts")\
        .select("*")\
        .gte("date", today)\
        .execute()
    
    if not forecast_resp.data:
        print("⚠️ No forecasts found. Please run fetch_tmd_forecast.py first.")
        return pd.DataFrame()

    df_forecast = pd.DataFrame(forecast_resp.data)
    
    # 2. ดึง Districts
    dist_resp = supabase.table("districts").select("*").execute()
    df_dist = pd.DataFrame(dist_resp.data)
    
    # 3. Merge
    df = pd.merge(df_forecast, df_dist, on='dcode', how='inner')
    return df

def prepare_features(df):
    """คำนวณ Feature Engineering ให้เหมือนตอนเทรนเป๊ะๆ"""
    # Handle div by 0
    df['pump_number'] = df['pump_number'].replace(0, 1)
    df['area'] = df['area'].replace(0, 1)
    
    # Calculation
    df['rain_load'] = df['rain_24h'] / df['pump_number']
    df['pump_density'] = df['pump_number'] / df['area']
    df['canal_density'] = df['canal_count'] / df['area']
    df['pop_density'] = df['population'] / df['area']
    
    # Season Encoding (TMD Forecast ไม่มี season, เราอาจต้องคำนวณเองหรือใส่ Unknown)
    # ในที่นี้ใส่ 0 (Unknown/Winter) ไปก่อน เพราะโมเดลให้ความสำคัญกับ season น้อย
    df['season_code'] = 0 
    
    # เลือกเฉพาะคอลัมน์ที่โมเดลต้องใช้ (เรียงลำดับต้องเป๊ะ!)
    feature_cols = [
        'rain_24h', 'rain_load', 'pump_density', 
        'canal_density', 'pop_density', 'flood_point_count', 'season_code'
    ]
    
    return df[feature_cols], df # คืนค่า X และ df เต็ม

def run_l4_simulation(row_data, current_risk):
    """
    L4: ถ้าเสี่ยงสูง ให้ลองเพิ่มปั๊มดูซิว่าต้องเพิ่มกี่ตัวถึงจะรอด?
    """
    if current_risk != 'High Risk':
        return 0 # ไม่ต้องเพิ่ม
    
    original_pumps = row_data['pump_number']
    total_rain = row_data['rain_24h']
    area = row_data['area']
    
    # ลองเพิ่มปั๊มทีละ 1 ตัว (สูงสุด 20 ตัว)
    for added in range(1, 21):
        new_pumps = original_pumps + added
        
        # คำนวณ Feature ใหม่
        new_rain_load = total_rain / new_pumps
        new_pump_density = new_pumps / area
        
        # สร้าง DataFrame แถวเดียวเพื่อทำนาย
        sim_features = pd.DataFrame([[
            total_rain, new_rain_load, new_pump_density,
            row_data['canal_density'], row_data['pop_density'],
            row_data['flood_point_count'], 0
        ]], columns=[
            'rain_24h', 'rain_load', 'pump_density', 
            'canal_density', 'pop_density', 'flood_point_count', 'season_code'
        ])
        
        new_risk = model.predict(sim_features)[0]
        
        if new_risk != 'High Risk':
            return added # เจอแล้ว! จำนวนที่ต้องเพิ่ม
            
    return 20 # ถ้าเพิ่ม 20 แล้วยังไม่รอด ก็ยอมแพ้ (หรือแนะนำ 20+)

def main():
    print("🚀 Starting Daily Prediction Pipeline...")
    
    df_full = get_latest_forecasts()
    if df_full.empty: return

    # 1. Prepare Features (L3 Input)
    X, df_ready = prepare_features(df_full)
    
    # 2. Predict Risk (L3 Output)
    print(f"🔮 Predicting risk for {len(X)} records...")
    pred_indices = model.predict(X)
    predictions = encoder.inverse_transform(pred_indices)
    df_ready['risk_level'] = predictions
    
    # 3. Run L4 Simulation (สำหรับเขตที่เสี่ยงสูง)
    print("🛡️ Running L4 Prescriptive Simulation...")
    recommendations = []
    
    for idx, row in df_ready.iterrows():
        added_pumps = run_l4_simulation(row, row['risk_level'])
        recommendations.append(added_pumps)
        
    df_ready['recommended_pumps'] = recommendations
    
    # 4. Save to Database
    print("💾 Saving predictions to 'predictions' table...")
    records_to_save = []
    
    for idx, row in df_ready.iterrows():
        records_to_save.append({
            "date": row['date'],
            "dcode": row['dcode'],
            "risk_level": row['risk_level'],
            "rain_load": row['rain_load'],
            "recommended_pumps": row['recommended_pumps'],
            "created_at": datetime.now().isoformat()
        })
    
    # Upsert (ทับของเดิมถ้าวันที่+เขตซ้ำกัน)
    # *หมายเหตุ: ตาราง predictions ควรมี unique constraint (date, dcode)
    try:
        # ลบของเก่าในวันเดียวกันออกก่อน (วิธีง่ายสุดเพื่อกันซ้ำ)
        dates = list(set([r['date'] for r in records_to_save]))
        supabase.table("predictions").delete().in_("date", dates).execute()
        
        # Insert ใหม่
        supabase.table("predictions").insert(records_to_save).execute()
        print(f"✅ Successfully saved {len(records_to_save)} predictions!")
        
        # Show Summary
        print("\n📊 Prediction Summary:")
        print(df_ready['risk_level'].value_counts())
        
    except Exception as e:
        print(f"❌ Database Error: {e}")

if __name__ == "__main__":
    main()