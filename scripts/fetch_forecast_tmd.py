import os
import time
import requests
import pandas as pd
import json
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Config ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TMD_TOKEN = os.getenv("TMD_TOKEN")

if not TMD_TOKEN:
    raise ValueError("❌ Error: Missing TMD_TOKEN in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_districts():
    """ดึงรายชื่อเขตทั้งหมดจาก DB"""
    response = supabase.table("districts").select("dcode, dname").execute()
    return response.data

def fetch_tmd_forecast(district_name, dcode):
    """ดึงข้อมูลพยากรณ์รายวัน"""
    url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/place"
    
    # Clean Name
    amphoe_name = district_name.replace("เขต", "").strip()
    if amphoe_name == "ป้อมปราบฯ": amphoe_name = "ป้อมปราบศัตรูพ่าย"
    
    params = {
        'province': 'กรุงเทพมหานคร',
        'amphoe': amphoe_name,
        'fields': 'rain,tc_max,tc_min,rh,cond',
        'duration': 3 # ล่วงหน้า 3 วัน
    }
    
    headers = {
        'authorization': f'Bearer {TMD_TOKEN}', 
        'accept': 'application/json'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Handle JSON Structure Variations
            root = data.get('WeatherForecasts') or data.get('weather_forecast')
            if not root: return []

            locations = root if isinstance(root, list) else root.get('locations', [])
            if not locations: return []
                
            forecasts = locations[0].get('forecasts', [])
            results = []
            
            for f in forecasts:
                date_str = f['time'].split('T')[0]
                val = f['data']
                
                results.append({
                    "date": date_str,
                    "dcode": dcode,
                    "rain_24h": val.get('rain', 0.0),
                    "temp_max": val.get('tc_max'),
                    "temp_min": val.get('tc_min'),
                    "humidity": val.get('rh'),
                    "condition": str(val.get('cond')),
                    "fetched_at": datetime.now().isoformat() # Stamp เวลาที่ดึงล่าสุด
                })
            return results
        else:
            print(f"   ❌ API Error {response.status_code} for {district_name}")
            return []
            
    except Exception as e:
        print(f"   ⚠️ Error fetching {district_name}: {e}")
        return []

def main():
    print("🌤️  Starting Automatic TMD Forecast Update...")
    districts = get_districts()
    
    print(f"   Found {len(districts)} districts. Processing...")
    
    all_forecasts = []
    
    # Loop ครบทุกเขต
    for i, dist in enumerate(districts):
        dname = dist['dname']
        dcode = dist['dcode']
        
        # Progress Indicator
        print(f"   [{i+1}/{len(districts)}] Fetching: {dname}...", end="\r")
        
        data = fetch_tmd_forecast(dname, dcode)
        all_forecasts.extend(data)
        
        time.sleep(0.2) # พักนิดนึงกันยิงรัวเกิน
        
    print(f"\n✅ Fetched total {len(all_forecasts)} records.")

    # --- Upsert to Database ---
    if all_forecasts:
        print("💾 Saving to Database (Upserting)...")
        
        # การ Upsert: Supabase จะดูที่ Constraint (date + dcode)
        # ถ้าเจอซ้ำ -> มันจะ Update ข้อมูลใหม่ทับของเดิมทันที (Data Freshness)
        try:
            # แบ่ง Insert ทีละ 100 แถว เพื่อความชัวร์ (Batch Insert)
            batch_size = 100
            for i in range(0, len(all_forecasts), batch_size):
                batch = all_forecasts[i:i + batch_size]
                supabase.table("rain_forecasts").upsert(
                    batch, on_conflict="date, dcode"
                ).execute()
                
            print("✨ All forecast data updated successfully!")
            
        except Exception as e:
            print(f"❌ Database Error: {e}")
    else:
        print("⚠️ No data fetched.")

if __name__ == "__main__":
    main()