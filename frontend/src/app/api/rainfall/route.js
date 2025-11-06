import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

// (สำคัญ!) นี่คือ Path ไปยังไฟล์ CSV ของคุณบน Server
// ผมสมมติว่ามันอยู่ใน /data/PROCESSED/ ตามโครงสร้างโปรเจกต์
const CSV_FILE_PATH = path.join(
  process.cwd(), // นี่คือ /frontend
  "..", // ถอยไปที่ /flowcast-flood-prediction
  "data",
  "PROCESSED",
  "rain_2024_combined_bkk_only.csv"
);

// ฟังก์ชันสำหรับโหลดและ Parse CSV (จะทำงานแค่ครั้งเดียว)
let rainDataCache = null;
async function getRainData() {
  if (rainDataCache) {
    return rainDataCache;
  }
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // พยายามแปลงตัวเลข
    });

    // (สำคัญ) แปลง 'วัน-เวลา' เป็น Date object
    rainDataCache = parsed.data.map((row) => ({
      ...row,
      date: new Date(row["วัน-เวลา"]),
    }));

    return rainDataCache;
  } catch (err) {
    console.error("Failed to read rain CSV:", err);
    return [];
  }
}

// นี่คือ API Endpoint หลัก
export async function GET(request) {
  try {
    // 1. ดึง query params จาก URL
    const { searchParams } = new URL(request.url);
    const dcode = searchParams.get("dcode");
    const month = searchParams.get("month"); // เดือน (1-12)

    if (!dcode) {
      return NextResponse.json(
        { error: "Missing dcode parameter" },
        { status: 400 }
      );
    }

    // 2. โหลดข้อมูล (จาก Cache หรือไฟล์)
    const allData = await getRainData();

    // 3. กรองข้อมูลตาม dcode
    let filteredData = allData.filter((row) => row.dcode == dcode);

    // 4. (ถ้ามี) กรองข้อมูลตามเดือน
    // Note: getMonth() คืนค่า 0-11, ดังนั้นเราต้อง -1 จากเดือนที่รับมา
    if (month && month !== "all") {
      const monthIndex = parseInt(month) - 1;
      filteredData = filteredData.filter(
        (row) => row.date.getMonth() === monthIndex
      );
    }

    // 5. จัดรูปแบบข้อมูลให้ Nivo Line Chart
    // Nivo ต้องการ { id: "ชื่อเส้น", data: [{ x: วันที่, y: ค่า }] }
    const chartData = [
      {
        id: "Rainfall (24h)",
        data: filteredData.map((row) => ({
          x: row.date.toISOString().split("T")[0], // "YYYY-MM-DD"
          y: row["ฝน 24 ชม."],
        })),
      },
    ];

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
