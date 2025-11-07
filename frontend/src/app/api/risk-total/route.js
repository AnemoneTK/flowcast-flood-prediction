// frontend/src/app/api/risk-total/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

// (ปรับแก้) Path ไปยังไฟล์ CSV ใหม่
const RISK_TOTAL_PATH = path.resolve(
  process.cwd(),
  "public",
  "data",
  "master_district_features.csv" // <--- (ปรับแก้) ใช้ไฟล์ Master ใหม่
);

let totalDataCache = null;

async function getTotalRiskData() {
  if (totalDataCache) {
    return totalDataCache;
  }
  try {
    const fileContent = await fs.readFile(RISK_TOTAL_PATH, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // พยายามแปลงตัวเลข
    });

    totalDataCache = parsed.data;
    return totalDataCache;
  } catch (err) {
    console.error("API [risk-total] Error: Failed to read CSV:", err);
    throw new Error(`Could not load total risk data. Error: ${err.message}`);
  }
}

export async function GET() {
  try {
    const totalRiskData = await getTotalRiskData();

    // (ปรับแก้) อ่านข้อมูลจากคอลัมน์ที่ถูกต้องในไฟล์ใหม่
    const results = totalRiskData
      .map((row) => {
        return {
          dcode: row.dcode ? row.dcode.toString() : null,
          dname: row.dname,
          value: row["คะแนนรวม"], // ดึงค่าจากคอลัมน์ "คะแนนรวม"
        };
      })
      .filter((row) => row.dcode && row.dname && row.value != null);

    return NextResponse.json(results);
  } catch (error) {
    console.error("API [risk-total] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
