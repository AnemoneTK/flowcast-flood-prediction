import os
import time
import pandas as pd
from datetime import date, timedelta, datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
import io

# --- 1. Setup & Config ---
load_dotenv() 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TARGET_URL = "https://weather.bangkok.go.th/rain/RainHistory/IndexAllStation"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Error: Missing SUPABASE_URL or SUPABASE_KEY in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- 2. Helper Functions ---

def get_district_mapping():
    """ดึงข้อมูลเขตจาก DB เพื่อ map ชื่อ -> dcode"""
    try:
        response = supabase.table("districts").select("dcode, dname").execute()
        mapping = {}
        for item in response.data:
            dname = item['dname'].strip()
            dcode = item['dcode']
            mapping[dname] = dcode
            short_name = dname.replace("เขต", "").strip()
            mapping[short_name] = dcode
            # แก้คำผิดที่พบบ่อย
            if short_name == "ราษฎร์บูรณะ": mapping["ราษฏร์บูรณะ"] = dcode
            if short_name == "พญาไท": mapping["พยาไท"] = dcode
        return mapping
    except Exception as e:
        logging.error(f"Failed to fetch district mapping: {e}")
        return {}

def get_latest_db_date():
    """เช็ควันที่ล่าสุดใน DB"""
    try:
        response = supabase.table("rain_logs") \
            .select("date") \
            .eq("is_forecast", False) \
            .order("date", desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            return datetime.strptime(response.data[0]['date'], '%Y-%m-%d').date()
        else:
            return date(2023, 1, 1)
    except Exception as e:
        logging.error(f"Database connection error: {e}")
        return None

def get_season(date_obj):
    m = date_obj.month
    if m in [11, 12, 1]: return 'Winter'
    if m in [3, 4]: return 'Summer'
    if m in [6, 7, 8, 9]: return 'Rainy'
    if m == 2: return 'Summer' 
    if m == 5: return 'Rainy'
    if m == 10: return 'Winter'
    return 'Unknown'

def scrape_rain_headless(target_date):
    """
    ดึงข้อมูลแบบ Headless (ไม่เปิดจอ) โดยบังคับให้ตารางแสดงครบทุกแถว
    """
    driver = None
    df = None
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            # Setup Headless Driver
            options = webdriver.ChromeOptions()
            options.add_argument("--headless=new") # ใช้โหมด Headless ใหม่ (เสถียรกว่า)
            options.add_argument("--window-size=1920,1080") # จอใหญ่กัน Layout เพี้ยน
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            
            service = ChromeService(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)

            # Prepare Date
            thai_year = target_date.year + 543
            date_str = target_date.strftime(f"%d/%m/{thai_year}")
            logging.info(f"   ...Scraping for {date_str} (Attempt {attempt+1})")

            driver.get(TARGET_URL)
            
            # 1. Input Date
            WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.ID, "datePick")))
            date_input = driver.find_element(By.ID, "datePick")
            driver.execute_script(f"arguments[0].value = '{date_str}';", date_input)

            # 2. Input Time
            time_input = driver.find_element(By.ID, "StationTime")
            driver.execute_script("arguments[0].value = '00:00';", time_input)
            
            # 3. Select 24hr
            rain_type = Select(driver.find_element(By.ID, "account"))
            rain_type.select_by_value("8")

            # 4. Click Search (Force Click)
            search_btn = driver.find_element(By.ID, "btnSearch")
            driver.execute_script("arguments[0].scrollIntoView(true);", search_btn)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", search_btn)
            
            # 5. [ทีเด็ด] บังคับให้แสดงข้อมูล 100 แถว (Show All)
            # รอให้ตารางโหลดก่อน (สังเกตจากปุ่ม Copy ก็ได้)
            WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.LINK_TEXT, "Copy")))
            
            # พยายามหา Dropdown 'Show entries' แล้วเปลี่ยนค่า
            try:
                # ปกติ DataTables จะมี select name="..._length"
                length_select = driver.find_element(By.XPATH, "//select[contains(@name, 'length')]")
                select_obj = Select(length_select)
                # ลองเลือกค่ามากสุด (100 หรือ -1 สำหรับ All)
                try:
                    select_obj.select_by_value("100") # ลอง 100 ก่อน
                except:
                    select_obj.select_by_index(len(select_obj.options)-1) # ถ้าไม่มี 100 ให้เลือกตัวล่างสุด
                
                time.sleep(2) # รอให้ตารางขยาย
            except Exception as e:
                logging.warning(f"   ⚠️ Could not set table length: {e}. Might get partial data.")

            # 6. อ่าน HTML ตรงๆ (ไม่ต้องใช้ Clipboard)
            html = driver.page_source
            dfs = pd.read_html(io.StringIO(html))
            
            if dfs:
                df = dfs[0]
                # เช็คว่าได้ข้อมูลมาเยอะพอไหม (ต้อง > 10)
                if len(df) > 15:
                    logging.info(f"   ✅ Successfully scraped {len(df)} rows")
                    break
                else:
                    logging.warning(f"   ⚠️ Only got {len(df)} rows. Retrying...")
                    df = None
            
        except Exception as e:
            logging.error(f"   ❌ Selenium Error: {e}")
        
        finally:
            if driver:
                driver.quit()
        
        time.sleep(2)

    return df

def upload_to_supabase(df, target_date, district_map):
    records = []
    season = get_season(target_date)
    
    # Clean Data: หาชื่อคอลัมน์ที่ถูกต้อง
    dist_col = next((c for c in df.columns if 'เขต' in c or 'อำเภอ' in c), None)
    rain_col = next((c for c in df.columns if '24' in c or 'ฝนรวม' in c), None)
    
    if not dist_col or not rain_col:
        logging.error(f"   ❌ Column names mismatch. Found: {df.columns}")
        return

    for _, row in df.iterrows():
        dname = str(row[dist_col]).strip()
        rain_val = row[rain_col]
        
        dcode = district_map.get(dname)
        if not dcode:
             dcode = district_map.get(dname.replace("เขต", "").strip())
        
        if dcode:
            try:
                rain_float = float(str(rain_val).replace(',', ''))
            except:
                rain_float = 0.0
            
            records.append({
                "date": str(target_date),
                "dcode": dcode,
                "rain_24h": rain_float,
                "season": season,
                "is_forecast": False
            })

    # Aggregate
    if records:
        df_ready = pd.DataFrame(records)
        df_grouped = df_ready.groupby(['date', 'dcode', 'season', 'is_forecast'])['rain_24h'].mean().reset_index()
        data = df_grouped.to_dict(orient='records')
        
        try:
            supabase.table("rain_logs").insert(data).execute()
            logging.info(f"   💾 Saved to Database: {len(data)} districts")
        except Exception as e:
            logging.error(f"   ❌ DB Insert Error: {e}")
    else:
        logging.warning("   ⚠️ No valid records to upload.")

# --- 3. Main Execution ---

def main():
    print("🚀 Starting Rain Data Pipeline (Headless Mode)...")
    
    district_map = get_district_mapping()
    last_date = get_latest_db_date()
    
    start_date = last_date + timedelta(days=1)
    end_date = date.today() - timedelta(days=1) 
    
    if start_date > end_date:
        print("✨ Data is up to date!")
        return

    print(f"📅 Updating from {start_date} to {end_date}")

    current = start_date
    while current <= end_date:
        df = scrape_rain_headless(current)
        
        if df is not None and not df.empty:
            upload_to_supabase(df, current, district_map)
        else:
            print(f"   ⚠️ Skipping {current} (Failed to retrieve data)")
        
        current += timedelta(days=1)
        time.sleep(1)

if __name__ == "__main__":
    main()