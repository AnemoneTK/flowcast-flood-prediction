# scripts/api_predict.py
import sys
import json
import pandas as pd
import joblib
import os
import numpy as np

# ปิด Warning
import warnings
warnings.filterwarnings("ignore")

def load_models():
    base_path = os.path.join(os.path.dirname(__file__), '../models')
    models = {
        'XGBoost': joblib.load(f'{base_path}/flood_model_xgboost.pkl'),
        'RandomForest': joblib.load(f'{base_path}/flood_model_random_forest.pkl'),
        'LogisticRegression': joblib.load(f'{base_path}/flood_model_logistic_regression.pkl')
    }
    encoder = joblib.load(f'{base_path}/label_encoder.pkl')
    return models, encoder

def main():
    try:
        # 1. รับข้อมูล JSON จาก Argument
        input_str = sys.argv[1]
        data = json.loads(input_str)

        # 2. เตรียมข้อมูล (Feature Engineering)
        # คำนวณตัวแปรตามสูตรเดียวกับที่ใช้เทรน
        rain_24h = float(data.get('rain_24h', 0))
        pump_number = float(data.get('pump_number', 1))
        canal_count = float(data.get('canal_count', 1))
        area = float(data.get('area', 1))
        population = float(data.get('population', 0))
        flood_point = float(data.get('flood_point_count', 0))

        # Handle div by zero
        if pump_number <= 0: pump_number = 1
        if area <= 0: area = 1

        features = pd.DataFrame([{
            'rain_24h': rain_24h,
            'rain_load': rain_24h / pump_number,
            'pump_density': pump_number / area,
            'canal_density': canal_count / area,
            'pop_density': population / area,
            'flood_point_count': flood_point,
            'season_code': 0 # Default (สมมติเป็นหน้าฝนหรือทั่วไป)
        }])

        # 3. โหลดโมเดลและทำนาย
        models, encoder = load_models()
        results = {}

        for name, model in models.items():
            pred_idx = model.predict(features)[0]
            pred_label = encoder.inverse_transform([pred_idx])[0]
            
            # แปลงเป็น Probability (ถ้าโมเดลรองรับ) เพื่อดูความมั่นใจ
            prob = 0
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(features)[0]
                prob = max(probs) * 100
            
            results[name] = {
                "risk": pred_label,
                "confidence": round(prob, 2)
            }

        # 4. L4 Simulation (Prescriptive)
        # ใช้ Champion Model (XGBoost) แนะนำจำนวนปั๊ม
        recommendation = 0
        if results['XGBoost']['risk'] == 'High Risk':
            current_risk = 'High Risk'
            added_pumps = 0
            temp_features = features.copy()
            
            # ลองเพิ่มปั๊มทีละ 1 จนกว่าความเสี่ยงจะลด หรือครบ 20 ตัว
            while current_risk == 'High Risk' and added_pumps < 20:
                added_pumps += 1
                new_pumps = pump_number + added_pumps
                
                # Recalculate related features
                temp_features['rain_load'] = rain_24h / new_pumps
                temp_features['pump_density'] = new_pumps / area
                
                new_pred_idx = models['XGBoost'].predict(temp_features)[0]
                current_risk = encoder.inverse_transform([new_pred_idx])[0]
            
            if current_risk != 'High Risk':
                recommendation = added_pumps

        # 5. ส่งผลลัพธ์กลับเป็น JSON
        output = {
            "predictions": results,
            "recommendation": recommendation,
            "features": features.to_dict(orient='records')[0]
        }
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()