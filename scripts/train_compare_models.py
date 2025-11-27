import os
import pandas as pd
import numpy as np
import joblib
from supabase import create_client, Client
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score
from xgboost import XGBClassifier
from dotenv import load_dotenv

# --- Config ---
load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# --- Helper Functions (เหมือนเดิม) ---
def fetch_and_prep_data():
    print("📥 Fetching data...")
    rain_resp = supabase.table("rain_logs").select("*").eq("is_forecast", False).execute()
    df_rain = pd.DataFrame(rain_resp.data)
    dist_resp = supabase.table("districts").select("*").execute()
    df_dist = pd.DataFrame(dist_resp.data)
    df = pd.merge(df_rain, df_dist, on='dcode', how='inner')
    
    # Synthetic Data Injection (สำคัญมากช่วงหน้าแล้ง)
    print("🧪 Generating synthetic data...")
    syn_df = df.sample(300, replace=True).copy() # เพิ่มจำนวนหน่อย
    syn_df['rain_24h'] = np.random.uniform(50, 250, 300) # ฝนหนัก
    syn_df['season'] = 'Rainy'
    df = pd.concat([df, syn_df], ignore_index=True)
    
    # Feature Engineering
    df['pump_number'] = df['pump_number'].replace(0, 1)
    df['area'] = df['area'].replace(0, 1)
    df['rain_load'] = df['rain_24h'] / df['pump_number']
    df['pump_density'] = df['pump_number'] / df['area']
    df['canal_density'] = df['canal_count'] / df['area']
    df['pop_density'] = df['population'] / df['area']
    season_map = {'Winter': 0, 'Summer': 1, 'Rainy': 2, 'Unknown': 0}
    df['season_code'] = df['season'].map(season_map).fillna(0)
    
    # Labelling
    def define_risk(row):
        if row['rain_load'] > 100: return 'High Risk'
        elif row['rain_load'] > 30: return 'Well Managed'
        else: return 'Low Risk'
    df['risk_level'] = df.apply(define_risk, axis=1)
    
    return df

# --- Main Training Logic ---
def train_multiple_models():
    df = fetch_and_prep_data()
    
    features = ['rain_24h', 'rain_load', 'pump_density', 'canal_density', 'pop_density', 'flood_point_count', 'season_code']
    X = df[features]
    y_raw = df['risk_level']
    
    # Label Encoding (จำเป็นสำหรับ XGBoost)
    le = LabelEncoder()
    y = le.fit_transform(y_raw) # แปลง String -> 0, 1, 2
    
    # Save Label Encoder (ต้องใช้ตอน API แปลงกลับ)
    os.makedirs('models', exist_ok=True)
    joblib.dump(le, 'models/label_encoder.pkl')
    print(f"🔤 Classes: {le.classes_}") # ดูลำดับ Class
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # --- Define Models ---
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
        
        "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42),
        
        # Logistic Regression ต้อง Scale ข้อมูลก่อนเสมอ
        "Logistic Regression": make_pipeline(StandardScaler(), LogisticRegression(multi_class='multinomial', max_iter=1000))
    }
    
    print("\n🏁 Starting Model Comparison...")
    print(f"{'Model Name':<20} | {'Accuracy':<10} | {'F1-Score (Macro)':<15}")
    print("-" * 50)
    
    results = {}
    
    for name, model in models.items():
        # Train
        model.fit(X_train, y_train)
        
        # Predict
        y_pred = model.predict(X_test)
        
        # Score
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='macro')
        
        print(f"{name:<20} | {acc:.4f}     | {f1:.4f}")
        
        # Save
        filename = f"models/flood_model_{name.lower().replace(' ', '_')}.pkl"
        # สำหรับ Pipeline หรือ XGBoost เราเซฟทั้งก้อนได้เลย
        joblib.dump(model, filename)
        results[name] = filename

    print(f"\n✅ All 3 models saved to 'models/' folder.")

if __name__ == "__main__":
    train_multiple_models()