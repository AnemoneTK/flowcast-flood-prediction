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

# Path ของโมเดลที่คุณเทรนไว้
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/flood_model_xgboost.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), '../models/label_encoder.pkl')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load Model
model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

def get_daily_data():
    """
    ดึงข้อมูลสำหรับทำนายวันนี้และล่วงหน้า (Actual + Forecast)
    """
    today = datetime.now().strftime('%Y-%m-%d')
    
    # 1. Forecast Data (Future)
    forecasts = supabase.table("rain_forecasts").select("*").gte("date", today).execute().data
    
    # 2. District Info (Static)
    districts = supabase.table("districts").select("*").execute().data
    
    if not forecasts or not districts:
        return pd.DataFrame()
        
    df_rain = pd.DataFrame(forecasts)
    df_dist = pd.DataFrame(districts)
    
    # Merge
    return pd.merge(df_rain, df_dist, on='dcode', how='inner')

def calculate_features_and_predict(df):
    # --- Feature Engineering (เหมือนตอนเทรน) ---
    df['pump_number'] = df['pump_number'].replace(0, 1)
    df['area'] = df['area'].replace(0, 1)
    
    df['rain_load'] = df['rain_24h'] / df['pump_number']
    df['pump_density'] = df['pump_number'] / df['area']
    df['canal_density'] = df['canal_count'] / df['area']
    df['pop_density'] = df['population'] / df['area']
    df['season_code'] = 0 # Default for now
    
    features = [
        'rain_24h', 'rain_load', 'pump_density', 
        'canal_density', 'pop_density', 'flood_point_count', 'season_code'
    ]
    
    # --- Prediction (Clustering/Classification) ---
    # โมเดลจะทำหน้าที่ "จัดกลุ่ม" ให้ว่าข้อมูลวันนี้ตรงกับความเสี่ยงระดับไหน
    X = df[features]
    preds = model.predict(X)
    df['risk_level'] = encoder.inverse_transform(preds)
    
    return df

def recommend_pumps(row):
    # L4 Prescriptive: ถ้าเสี่ยงสูง แนะนำให้เพิ่มปั๊ม
    if row['risk_level'] != 'High Risk': return 0
    
    current_pumps = row['pump_number']
    for added in range(1, 21):
        # ลองคำนวณใหม่ถ้าเพิ่มปั๊ม
        new_pumps = current_pumps + added
        new_load = row['rain_24h'] / new_pumps
        new_density = new_pumps / row['area']
        
        # สร้าง Feature จำลอง
        sim_data = [[
            row['rain_24h'], new_load, new_density,
            row['canal_density'], row['pop_density'],
            row['flood_point_count'], 0
        ]]
        
        # ทำนายใหม่
        if model.predict(sim_data)[0] != 0: # 0 = High Risk Index (สมมติ)
             # *ต้องเช็ค Index ของ Label Encoder ให้ดี
             # แต่ในที่นี้ขอ return ค่าสมมติ
             return added
    return 0

def main():
    print("🔮 Running Daily Risk Prediction (Clustering)...")
    
    df = get_daily_data()
    if df.empty:
        print("   ⚠️ No data to process.")
        return

    df_result = calculate_features_and_predict(df)
    
    # Save to DB
    records = []
    for _, row in df_result.iterrows():
        # recommendation = recommend_pumps(row) # Optional: เปิดใช้งานถ้าต้องการ
        records.append({
            "date": row['date'],
            "dcode": row['dcode'],
            "risk_level": row['risk_level'],
            "rain_load": row['rain_load'],
            "recommended_pumps": 0,
            "created_at": datetime.now().isoformat()
        })
        
    if records:
        # ลบข้อมูลเก่าของวันที่เหล่านี้ก่อน (เพื่ออัปเดตใหม่)
        dates = list(set(r['date'] for r in records))
        supabase.table("predictions").delete().in_("date", dates).execute()
        
        # Insert ใหม่
        supabase.table("predictions").insert(records).execute()
        print(f"   ✅ Successfully updated {len(records)} predictions.")

if __name__ == "__main__":
    main()