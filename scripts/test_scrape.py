import os
import time
import pandas as pd
from datetime import date
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
import io
import logging

# Config Logger
logging.basicConfig(level=logging.INFO, format='%(message)s')

# URL เป้าหมาย
TARGET_URL = "https://weather.bangkok.go.th/rain/RainHistory/IndexAllStation"

def scrape_specific_date(target_date):
    """
    ดึงข้อมูลเฉพาะวันที่ระบุ และแสดงผลลัพธ์
    """
    driver = None
    try:
        # 1. Setup Driver
        options = webdriver.ChromeOptions()
        # options.add_argument("--headless=new") # เปิดหน้าจอเพื่อดูการทำงาน
        options.add_argument("--window-size=1920,1080")
        
        # แก้ไขวันที่เป็น Format ค.ศ. (dd/mm/yyyy) เช่น 16/10/2025
        date_str = target_date.strftime("%d/%m/%Y")
        
        print(f"🚀 Launching Browser to scrape: {date_str}")
        
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

        print(f"   👉 Inputting Date: {date_str} (Time: 00:00, 24hr)")

        driver.get(TARGET_URL)
        
        # 3. Input Form Data
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.ID, "datePick")))
        
        # Date
        date_input = driver.find_element(By.ID, "datePick")
        driver.execute_script(f"arguments[0].value = '{date_str}';", date_input)

        # Time
        time_input = driver.find_element(By.ID, "StationTime")
        driver.execute_script("arguments[0].value = '00:00';", time_input)
        
        # Type (24 hr)
        rain_type = Select(driver.find_element(By.ID, "account"))
        rain_type.select_by_value("8")

        # 4. Click Search
        search_btn = driver.find_element(By.ID, "btnSearch")
        driver.execute_script("arguments[0].scrollIntoView(true);", search_btn)
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", search_btn)
        
        print("   ⏳ Waiting for table to load...")
        
        # 5. Change Table Length to "Show All"
        # รอให้ตารางโหลดและปุ่ม Copy โผล่มาก่อน
        WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.LINK_TEXT, "Copy")))
        
        try:
            # พยายามหา Dropdown 'Show entries' แล้วเปลี่ยนค่า
            length_select_elem = driver.find_element(By.NAME, "table_length") 
            length_select = Select(length_select_elem)
            length_select.select_by_value("-1") # -1 มักแปลว่า All
            print("   ✅ Changed table display to 'All rows'")
            time.sleep(3) # รอให้ตารางขยาย
        except:
            print("   ⚠️ Could not change table length automatically. Trying to scrape visible rows...")

        # 6. Scrape HTML
        html = driver.page_source
        dfs = pd.read_html(io.StringIO(html))
        
        if dfs:
            df = dfs[0]
            print("\n" + "="*50)
            print(f"🎉 Scrape Success! Found {len(df)} rows.")
            print("="*50)
            
            # 7. Clean & Show Data
            # ลองหาชื่อ column ที่น่าจะเป็นปริมาณฝน
            rain_col = next((c for c in df.columns if '24' in str(c) or 'ฝนรวม' in str(c)), None)
            dist_col = next((c for c in df.columns if 'เขต' in str(c) or 'อำเภอ' in str(c)), None)
            
            if rain_col and dist_col:
                print(f"   - District Column: '{dist_col}'")
                print(f"   - Rain Column:     '{rain_col}'")
                
                # แปลงเป็นตัวเลขและกรองเฉพาะที่มีฝน
                df[rain_col] = pd.to_numeric(df[rain_col], errors='coerce').fillna(0)
                
                print("\n🔎 ตัวอย่างข้อมูล 10 แถวแรก:")
                print(df[[dist_col, rain_col]].head(10).to_string(index=False))
                
                # เช็คค่าสูงสุด
                max_rain = df[rain_col].max()
                avg_rain = df[rain_col].mean()
                print("\n📊 สถิติของวันนี้:")
                print(f"   - ฝนสูงสุด: {max_rain} mm")
                print(f"   - ฝนเฉลี่ย: {avg_rain:.2f} mm")
                
                if max_rain == 0:
                    print("\n⚠️  WARNING: ค่าฝนเป็น 0 ทุกเขต!")
            else:
                print("\n❌ Could not identify rain/district columns.")
                print("Columns found:", df.columns.tolist())
                
        else:
            print("❌ Pandas read_html failed to find any table.")

    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        print("\nClosing driver in 10 seconds...")
        time.sleep(10) # รอให้คุณดูหน้าเว็บก่อนปิด
        if driver:
            driver.quit()

if __name__ == "__main__":
    # กำหนดวันที่ต้องการทดสอบ: 16 ตุลาคม 2025
    TEST_DATE = date(2025, 10, 16)
    scrape_specific_date(TEST_DATE)