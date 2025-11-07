// frontend/src/app/api/rainfall/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

// (สำคัญ!) นี่คือ Path ไปยังไฟล์ CSV (ตัวใหม่)
const CSV_FILE_PATH = path.resolve(
  process.cwd(), // นี่คือ /frontend
  "..", // ถอยไปที่ /flowcast-flood-prediction
  "data",
  "PROCESSED",
  // --- *** นี่คือจุดที่แก้ไข *** ---
  "rain_2024_with_seasons.csv" // ใช้ไฟล์ใหม่ที่มี พ.ศ. ที่ถูกต้อง
);

let rainDataCache = null;

async function getRainData() {
  if (rainDataCache) {
    return rainDataCache;
  }
  try {
    console.log(`API [rainfall]: Loading rain data from: ${CSV_FILE_PATH}`);
    const fileContent = await fs.readFile(CSV_FILE_PATH, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    // (แก้) เราจะใช้คอลัมน์ 'date_object' ที่เราสร้างไว้ (ค.ศ. ที่ถูกต้อง)
    rainDataCache = parsed.data.map((row) => ({
      ...row,
      date: new Date(row["date_object"]),
    }));

    console.log(
      `API [rainfall]: Successfully cached ${rainDataCache.length} rain records.`
    );
    return rainDataCache;
  } catch (err) {
    console.error("API [rainfall] Error: Failed to read CSV:", err);
    throw new Error(
      `Could not load rain data. Path: ${CSV_FILE_PATH}. Error: ${err.message}`
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dcode = searchParams.get("dcode");
    const month = searchParams.get("month"); // เดือน (1-12)

    if (!dcode) {
      return NextResponse.json(
        { error: "Missing dcode parameter" },
        { status: 400 }
      );
    }

    const allData = await getRainData();

    // 3. กรองข้อมูลตาม dcode
    let filteredData = allData.filter((row) => row.dcode == dcode);

    // 4. (ถ้ามี) กรองข้อมูลตามเดือน
    if (month && month !== "all") {
      const monthIndex = parseInt(month) - 1; // 0 = Jan
      filteredData = filteredData.filter(
        (row) => row.date.getMonth() === monthIndex
      );
    }

    // 5. จัดรูปแบบข้อมูลให้ Nivo Line Chart
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
    console.error("API [rainfall] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
