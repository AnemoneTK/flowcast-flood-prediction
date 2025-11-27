import os
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from supabase import create_client, Client
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

# --- 1. Setup ---
load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ตั้งค่า Font ให้กราฟสวยงาม
plt.style.use('ggplot')
sns.set_palette("husl")

def fetch_and_prep_data():
    print("📥 Fetching test data from DB...")
    rain_resp = supabase.table("rain_logs").select("*").eq("is_forecast", False).execute()
    df_rain = pd.DataFrame(rain_resp.data)
    dist_resp = supabase.table("districts").select("*").execute()
    df_dist = pd.DataFrame(dist_resp.data)
    df = pd.merge(df_rain, df_dist, on='dcode', how='inner')
    
    # Synthetic Data Injection (เพื่อให้มีเคส High Risk ให้ทดสอบ)
    syn_df = df.sample(200, replace=True).copy()
    syn_df['rain_24h'] = np.random.uniform(50, 250, 200)
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
    
    def define_risk(row):
        if row['rain_load'] > 100: return 'High Risk'
        elif row['rain_load'] > 30: return 'Well Managed'
        else: return 'Low Risk'
    df['risk_level'] = df.apply(define_risk, axis=1)
    
    return df

def evaluate_and_plot():
    df = fetch_and_prep_data()
    
    features = ['rain_24h', 'rain_load', 'pump_density', 'canal_density', 'pop_density', 'flood_point_count', 'season_code']
    X = df[features]
    y_raw = df['risk_level']
    
    # Encode Label
    le = joblib.load('models/label_encoder.pkl')
    y = le.transform(y_raw)
    
    # Split Test Set (20%)
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Load Models
    models = {
        "Random Forest": joblib.load("models/flood_model_random_forest.pkl"),
        "XGBoost": joblib.load("models/flood_model_xgboost.pkl"),
        "Logistic Reg": joblib.load("models/flood_model_logistic_regression.pkl")
    }
    
    # Calculate Metrics
    results = []
    for name, model in models.items():
        y_pred = model.predict(X_test)
        results.append({
            "Model": name,
            "Accuracy": accuracy_score(y_test, y_pred),
            "F1-Score": f1_score(y_test, y_pred, average='macro'),
            "Precision": precision_score(y_test, y_pred, average='macro'),
            "Recall": recall_score(y_test, y_pred, average='macro')
        })
        
    df_results = pd.DataFrame(results)
    print("\n📊 Model Performance Summary:")
    print(df_results)
    
    # --- Plotting ---
    print("\n🎨 Generating Comparison Charts...")
    
    # 1. Bar Chart เปรียบเทียบทุก Metric
    df_melted = df_results.melt(id_vars="Model", var_name="Metric", value_name="Score")
    
    plt.figure(figsize=(12, 6))
    ax = sns.barplot(x="Metric", y="Score", hue="Model", data=df_melted)
    
    # ใส่ตัวเลขบนแท่งกราฟ
    for container in ax.containers:
        ax.bar_label(container, fmt='%.3f', padding=3)
        
    plt.title("Model Performance Comparison (L3 Models)", fontsize=16)
    plt.ylim(0.8, 1.05) # Zoom ดูช่วงคะแนนสูงๆ
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    
    # Save Image
    os.makedirs('reports', exist_ok=True)
    plt.savefig('reports/model_comparison.png', dpi=300)
    print("✅ Graph saved to 'reports/model_comparison.png'")
    plt.show()

if __name__ == "__main__":
    evaluate_and_plot()