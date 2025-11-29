import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Setup
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing credentials")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync_clusters():
    print("🔄 Syncing clusters to Database...")
    
    # 2. อ่านไฟล์ผลลัพธ์ที่ถูกต้อง (ไฟล์นี้ควรอยู่ในเครื่องคุณจากการรัน Notebook)
    # ตรวจสอบ path ให้ถูกต้อง
    csv_path = 'data/PROCESSED/district_clustered_comparison.csv' 
    
    if not os.path.exists(csv_path):
        print(f"❌ File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path)
    
    # 3. วนลูปอัปเดตทีละเขต
    count = 0
    for index, row in df.iterrows():
        dcode = str(row['dcode'])
        cluster_id = int(row['cluster']) # เอาค่า K=3
        
        try:
            # Update เฉพาะ field 'cluster'
            supabase.table('districts')\
                .update({'cluster': cluster_id})\
                .eq('dcode', dcode)\
                .execute()
            
            print(f"   ✅ Updated {row['dname']} -> Cluster {cluster_id}")
            count += 1
        except Exception as e:
            print(f"   ❌ Error updating {dcode}: {e}")

    print(f"\n✨ Successfully updated {count} districts!")

if __name__ == "__main__":
    sync_clusters()