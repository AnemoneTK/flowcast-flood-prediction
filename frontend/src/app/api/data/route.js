// frontend/src/app/api/data/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

// (สำคัญ!) นี่คือ Path ไปยังไฟล์ CSV (ตัวใหม่) ของคุณบน Server
const CSV_FILE_PATH = path.resolve(
  process.cwd(), // นี่คือ /frontend
  "..", // ถอยไปที่ /flowcast-flood-prediction
  "data",
  "PROCESSED",
  // --- *** นี่คือจุดที่แก้ไข *** ---
  "master_features_clustered_seasonal.csv"
  // "master_features_clustered_v2_pca.csv"
);

let dataCache = null;

async function getData() {
  if (dataCache) {
    return dataCache;
  }
  try {
    console.log(`API [data]: Loading data from: ${CSV_FILE_PATH}`);
    const fileContent = await fs.readFile(CSV_FILE_PATH, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // พยายามแปลงตัวเลข
    });

    dataCache = parsed.data;
    console.log(`API [data]: Successfully cached ${dataCache.length} records.`);
    return dataCache;
  } catch (err) {
    console.error("API [data] Error: Failed to read CSV:", err);
    // (สำคัญ) ส่ง Error ที่อ่านง่ายขึ้น
    throw new Error(
      `Could not load data. Path: ${CSV_FILE_PATH}. Error: ${err.message}`
    );
  }
}

export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API [data] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
