# src/api/main.py
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel
import threading
import schedule
import time
import logging
import sys
import os
import pandas as pd
import joblib
import numpy as np # เพิ่ม numpy

# --- 1. SETUP LOGGING & PATHS ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [API] - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

# Setup paths
current_dir = os.path.dirname(os.path.abspath(__file__))
scripts_path = os.path.join(current_dir, '../../scripts')
models_path = os.path.join(current_dir, '../../models')
sys.path.append(scripts_path)

# Import Scripts
try:
    import update_rain_daily
    import fetch_forecast_tmd
    import predict_risk_daily
except ImportError as e:
    logging.warning(f"⚠️ Could not import script modules: {e}")

# --- 2. SCHEDULER LOGIC ---
def run_batch_job():
    logging.info("⏰ Starting Scheduled Batch Job...")
    try:
        update_rain_daily.main()
        fetch_forecast_tmd.main()
        predict_risk_daily.main()
        logging.info("✅ Batch Job Completed Successfully.")
    except Exception as e:
        logging.error(f"❌ Batch Job Failed: {e}")

def run_scheduler_loop():
    while True:
        schedule.run_pending()
        time.sleep(60)

# --- 3. LIFESPAN ---
models = {}
encoder = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("🚀 API Starting up...")
    global models, encoder
    try:
        models = {
            'XGBoost': joblib.load(f'{models_path}/flood_model_xgboost.pkl'),
            'RandomForest': joblib.load(f'{models_path}/flood_model_random_forest.pkl'),
            'LogisticRegression': joblib.load(f'{models_path}/flood_model_logistic_regression.pkl')
        }
        encoder = joblib.load(f'{models_path}/label_encoder.pkl')
        logging.info("✅ Models loaded successfully.")
    except Exception as e:
        logging.error(f"❌ Failed to load models: {e}")

    # Scheduler
    schedule.every().day.at("00:00").do(run_batch_job)
    schedule.every().day.at("06:00").do(run_batch_job)
    schedule.every().day.at("12:00").do(run_batch_job)
    schedule.every().day.at("18:00").do(run_batch_job)
    
    scheduler_thread = threading.Thread(target=run_scheduler_loop, daemon=True)
    scheduler_thread.start()
    
    yield
    logging.info("🛑 API Shutting down...")

# --- 4. API ROUTES ---
app = FastAPI(lifespan=lifespan)

class PredictionInput(BaseModel):
    rain_24h: float
    pump_number: float
    canal_count: float
    area: float
    population: float
    flood_point_count: float

@app.get("/")
def health_check():
    return {"status": "ok", "message": "FlowCast API Running"}

@app.post("/predict")
def predict_risk(data: PredictionInput):
    try:
        # 1. Feature Engineering
        if data.pump_number <= 0: data.pump_number = 1
        if data.area <= 0: data.area = 1

        features = pd.DataFrame([{
            'rain_24h': data.rain_24h,
            'rain_load': data.rain_24h / data.pump_number,
            'pump_density': data.pump_number / data.area,
            'canal_density': data.canal_count / data.area,
            'pop_density': data.population / data.area,
            'flood_point_count': data.flood_point_count,
            'season_code': 0 
        }])

        # 2. Prediction
        results = {}
        for name, model in models.items():
            pred_idx = model.predict(features)[0]
            pred_label = encoder.inverse_transform([pred_idx])[0]
            
            prob = 0.0
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(features)[0]
                prob = float(max(probs) * 100) # Convert numpy float
            
            results[name] = {
                "risk": str(pred_label),
                "confidence": round(prob, 2)
            }

        # 3. ✅ Prescriptive Logic (ใส่กลับมาให้แล้วครับ)
        recommendation = 0
        xgboost_risk = results.get('XGBoost', {}).get('risk')

        if xgboost_risk == 'High Risk':
            current_risk = 'High Risk'
            added_pumps = 0
            temp_features = features.copy()
            
            # จำลองการเพิ่มปั๊มทีละ 1 จนกว่าความเสี่ยงจะลด หรือเพิ่มครบ 20 ตัว
            while current_risk == 'High Risk' and added_pumps < 20:
                added_pumps += 1
                new_pumps = data.pump_number + added_pumps
                
                # คำนวณฟีเจอร์ใหม่ที่เปลี่ยนไปตามจำนวนปั๊ม
                temp_features['rain_load'] = data.rain_24h / new_pumps
                temp_features['pump_density'] = new_pumps / data.area
                
                # ทำนายใหม่
                new_pred_idx = models['XGBoost'].predict(temp_features)[0]
                current_risk = str(encoder.inverse_transform([new_pred_idx])[0])
            
            # ถ้าเพิ่มแล้วช่วยลดความเสี่ยงได้ จึงแนะนำ
            if current_risk != 'High Risk':
                recommendation = added_pumps

        # 4. Return Result
        return {
            "predictions": results,
            "recommendation": int(recommendation),
            "features": features.astype(float).to_dict(orient='records')[0]
        }

    except Exception as e:
        logging.error(f"Prediction Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)