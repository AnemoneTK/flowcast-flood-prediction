import schedule
import time
import logging
from datetime import datetime
import sys

# Import Modules (ต้องอยู่ในโฟลเดอร์เดียวกัน)
import update_rain_daily
import fetch_forecast_tmd
import predict_risk_daily

# Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [SCHEDULER] - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def job():
    """
    1 รอบการทำงาน: ดึงฝนจริง -> ดึงพยากรณ์ -> คำนวณความเสี่ยง
    """
    logging.info("⏰ Starting Scheduled Job...")
    
    try:
        # 1. อัปเดตฝนจริง (เมื่อวานและย้อนหลัง)
        update_rain_daily.main()
        
        # 2. อัปเดตพยากรณ์ (วันนี้และอนาคต)
        fetch_forecast_tmd.main()
        
        # 3. คำนวณความเสี่ยง/จัดกลุ่มใหม่ (ตามข้อมูลล่าสุด)
        predict_risk_daily.main()
        
        logging.info("✅ Job Completed Successfully.")
        
    except Exception as e:
        logging.error(f"❌ Job Failed: {e}")

def start_scheduler():
    # ตั้งเวลา 4 ช่วง
    schedule.every().day.at("00:00").do(job)
    schedule.every().day.at("06:00").do(job)
    schedule.every().day.at("12:00").do(job)
    schedule.every().day.at("18:00").do(job)
    
    # (Optional) รันทันที 1 ครั้งตอนเริ่มโปรแกรม เพื่อเช็คความพร้อม
    logging.info("🚀 Scheduler Started. Running initial job...")
    job()

    print("⏳ Waiting for next schedule... (Press Ctrl+C to stop)")
    while True:
        schedule.run_pending()
        time.sleep(60) # เช็คทุก 1 นาที

if __name__ == "__main__":
    start_scheduler()