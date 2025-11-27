import os
import pandas as pd
import numpy as np
import joblib
from supabase import create_client, Client
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix
from dotenv import load_dotenv

# --- 1. Setup ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Error: Missing SUPABASE_URL or SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_data():
    print("📥 1. Fetching data from Supabase...")
    
    rain_resp = supabase.table("rain_logs").select("*").eq("is_forecast", False).execute()
    df_rain = pd.DataFrame(rain_resp.data)
    
    if df_rain.empty:
        raise ValueError("❌ No rain data found! Run update scripts first.")

    dist_resp = supabase.table("districts").select("*").execute()
    df_dist = pd.DataFrame(dist_resp.data)
    
    df = pd.merge(df_rain, df_dist, on='dcode', how='inner')
    print(f"   ✅ Loaded {len(df)} daily records.")
    return df

def generate_synthetic_data(df, n_samples=200):
    """
    สร้างข้อมูลจำลองเหตุการณ์น้ำท่วม (Synthetic Data Injection)
    เพื่อให้โมเดลรู้จักคำว่า 'High Risk' แม้ช่วงนี้ฝนจะไม่ตกจริง
    """
    print(f"🧪 Generating {n_samples} synthetic flood scenarios...")
    
    # สุ่มตัวอย่างจากข้อมูลจริงมาเป็นฐาน
    synthetic_df = df.sample(n_samples, replace=True).copy()
    
    # จำลองฝนตกหนัก (Heavy Rain Simulation)
    # สุ่มฝนระหว่าง 60mm ถึง 200mm (ระดับพายุเข้า)
    synthetic_df['rain_24h'] = np.random.uniform(60, 250, n_samples)
    
    # จำลองฤดูฝน (Rainy Season)
    synthetic_df['season'] = 'Rainy'
    
    # รวมข้อมูลจริง + ข้อมูลจำลอง
    combined_df = pd.concat([df, synthetic_df], ignore_index=True)
    print(f"   ✅ Data augmented: {len(df)} -> {len(combined_df)} records")
    
    return combined_df

def feature_engineering(df):
    print("⚙️ 2. Feature Engineering...")
    
    df['pump_number'] = df['pump_number'].replace(0, 1) 
    df['area'] = df['area'].replace(0, 1)

    # Rain Load Calculation
    df['rain_load'] = df['rain_24h'] / df['pump_number']
    
    # Densities
    df['pump_density'] = df['pump_number'] / df['area']
    df['canal_density'] = df['canal_count'] / df['area']
    df['pop_density'] = df['population'] / df['area']
    
    # Season Encoding
    season_map = {'Winter': 0, 'Summer': 1, 'Rainy': 2, 'Unknown': 0}
    df['season_code'] = df['season'].map(season_map).fillna(0)
    
    # --- Labelling Logic (ปรับ Threshold ให้ละเอียดขึ้น) ---
    def define_risk(row):
        # Thresholds:
        # > 100: วิกฤต (ต้องการปั๊มช่วยด่วน)
        # > 30:  เริ่มตึงมือ (เฝ้าระวัง)
        # <= 30: ชิลๆ
        if row['rain_load'] > 100: return 'High Risk'
        elif row['rain_load'] > 30: return 'Well Managed'
        else: return 'Low Risk'
            
    df['risk_level'] = df.apply(define_risk, axis=1)
    
    print(f"   ✅ Target Distribution:\n{df['risk_level'].value_counts()}")
    return df

def train_model():
    df_raw = fetch_data()
    
    # *** เพิ่มขั้นตอนสร้างข้อมูลจำลอง ***
    df_augmented = generate_synthetic_data(df_raw)
    
    df = feature_engineering(df_augmented)
    
    features = [
        'rain_24h', 'rain_load', 'pump_density', 
        'canal_density', 'pop_density', 'flood_point_count', 'season_code'
    ]
    X = df[features]
    y = df['risk_level']
    
    print("\n🧠 3. Training & Tuning Model...")
    
    # ใช้ train_test_split ธรรมดาแทน TimeSeriesSplit 
    # เพราะตอนนี้ข้อมูลผสมกันระหว่างของจริงกับของจำลองแล้ว
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    rf = RandomForestClassifier(random_state=42)
    
    param_grid = {
        'n_estimators': [50, 100],
        'max_depth': [5, 10, None],
        'min_samples_split': [5, 10]
    }
    
    grid_search = GridSearchCV(rf, param_grid, cv=3, n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)
    
    best_model = grid_search.best_estimator_
    
    print(f"\n🏆 Best Params: {grid_search.best_params_}")
    print(f"📊 Test Accuracy: {best_model.score(X_test, y_test):.4f}")
    
    # Save
    os.makedirs('models', exist_ok=True)
    output_path = 'models/flood_model_v2.pkl'
    joblib.dump(best_model, output_path)
    print(f"💾 Model saved to: {output_path}")
    
    # Show Feature Importance (ควรจะมีค่าแล้วรอบนี้)
    print("\n📊 Feature Importance:")
    importances = pd.Series(best_model.feature_importances_, index=features)
    print(importances.sort_values(ascending=False))

if __name__ == "__main__":
    train_model()