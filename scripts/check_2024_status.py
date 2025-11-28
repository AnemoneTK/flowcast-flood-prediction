import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Setup
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    print("❌ Error: ไม่พบ .env")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_2024():
    print("🔍 Checking Database for 2024 data...\n")
    
    # 1. ลองดึงข้อมูลช่วงปี 2024
    response = supabase.table("rain_logs")\
        .select("*")\
        .gte("date", "2024-01-01")\
        .lte("date", "2024-12-31")\
        .limit(20)\
        .execute()
        
    rows = response.data
    
    # 2. เช็คจำนวนทั้งหมด (Count)
    count_response = supabase.table("rain_logs")\
        .select("id", count="exact")\
        .gte("date", "2024-01-01")\
        .lte("date", "2024-12-31")\
        .execute()
        
    total_count = count_response.count
    
    print(f"📊 Total Records for 2024: {total_count} rows")
    
    if total_count == 0:
        print("⚠️ Result: NO DATA for 2024 found.")
        print("   -> คุณต้อง Import ไฟล์ CSV ปี 2024 ลง Database ก่อน")
    else:
        print("✅ Result: Data found.")
        print("\n📝 Sample Data (First 5 rows):")
        df = pd.DataFrame(rows)
        print(df[['date', 'dcode', 'rain_24h']].head().to_string())
        
        # เช็คค่าฝนว่าเป็น 0 หมดไหม?
        avg_rain = df['rain_24h'].mean()
        print(f"\n💧 Average Rain in sample: {avg_rain:.2f} mm")
        if avg_rain == 0:
            print("   (Warning: ค่าฝนเป็น 0 ทั้งหมด อาจผิดปกติ)")

if __name__ == "__main__":
    check_2024()