import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Load Config
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing .env credentials")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def migrate():
    print("🚀 Migrating Cluster Data to Database...")
    
    # อ่านไฟล์ CSV ที่มีผลลัพธ์การจัดกลุ่ม (เลือกไฟล์ที่มี PC1, PC2)
    # ลองหาไฟล์ที่ชื่อ district_clustered_comparison.csv หรือ district_clustered_results.csv
    csv_path = 'data/PROCESSED/district_clustered_comparison.csv'
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV not found at: {csv_path}")
        return

    df = pd.read_csv(csv_path)
    print(f"   Found {len(df)} rows. Preparing to upload...")

    records = []
    for _, row in df.iterrows():
        # Clean Data: แปลง NaN เป็น None หรือ 0
        records.append({
            "dcode": int(row['dcode']),
            "year": int(row['year']),
            "cluster": int(row['cluster']), # ค่า K=3
            "pc1": float(row['PC1']) if pd.notna(row['PC1']) else 0,
            "pc2": float(row['PC2']) if pd.notna(row['PC2']) else 0,
            "rain_load": float(row['rain_load_per_pump']) if pd.notna(row['rain_load_per_pump']) else 0,
            "pump_density": float(row['pump_density']) if pd.notna(row['pump_density']) else 0
        })

    if records:
        try:
            # Upsert (ทับข้อมูลเก่าถ้า dcode+year ตรงกัน)
            supabase.table("district_clusters").upsert(records, on_conflict="dcode, year").execute()
            print(f"   ✅ Successfully uploaded {len(records)} rows to 'district_clusters'!")
        except Exception as e:
            print(f"   ❌ Upload failed: {e}")

if __name__ == "__main__":
    migrate()