// frontend/src/app/api/risk-scores/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";

// ... (Path และ Cache declarations ไม่เปลี่ยนแปลง) ...
const RISK_CSV_PATH = path.resolve(
  process.cwd(),
  "public",
  "data",
  "risk_scores_2024.csv"
);
const MAP_CSV_PATH = path.resolve(
  process.cwd(),
  "public",
  "data",
  "master_features_clustered_seasonal.csv"
);

let riskDataCache = null;
let districtMapCache = null;

// ... (Function: getDistrictMap ไม่เปลี่ยนแปลง) ...
async function getDistrictMap() {
  if (districtMapCache) return districtMapCache;
  try {
    const fileContent = await fs.readFile(MAP_CSV_PATH, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    const map = new Map();
    for (const row of parsed.data) {
      if (row.dcode && row.dname) {
        map.set(row.dcode.toString(), row.dname);
      }
    }
    districtMapCache = map;
    return districtMapCache;
  } catch (err) {
    console.error("API [risk-scores] Error: Failed to read map CSV:", err);
    throw new Error(`Could not load district map data. Error: ${err.message}`);
  }
}

// ... (Function: getRiskData ไม่เปลี่ยนแปลง) ...
async function getRiskData() {
  if (riskDataCache) return riskDataCache;
  try {
    const fileContent = await fs.readFile(RISK_CSV_PATH, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    riskDataCache = parsed.data;
    return riskDataCache;
  } catch (err) {
    console.error("API [risk-scores] Error: Failed to read risk CSV:", err);
    throw new Error(`Could not load risk data. Error: ${err.message}`);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const dcode = searchParams.get("dcode");
    const month = searchParams.get("month");

    if (!dcode || !month) {
      return NextResponse.json(
        { error: "Missing dcode or month parameters" },
        { status: 400 }
      );
    }

    if (dcode === "all" && month === "all") {
      return NextResponse.json([{ id: "Risk Score", data: [] }]);
    }

    const allRiskData = await getRiskData();
    let filteredData;

    if (dcode === "all") {
      filteredData = allRiskData.filter((row) => {
        if (month === "all") return true;
        const rowMonth = new Date(row.date).getMonth() + 1;
        return rowMonth.toString() === month;
      });
    } else {
      const districtMap = await getDistrictMap();
      const districtName = districtMap.get(dcode);

      if (!districtName) {
        return NextResponse.json(
          { error: `District name not found for dcode: ${dcode}` },
          { status: 404 }
        );
      }

      filteredData = allRiskData.filter((row) => {
        const isDistrictMatch = row.district_name_th === districtName;
        if (month === "all") {
          return isDistrictMatch;
        }
        const rowMonth = new Date(row.date).getMonth() + 1;
        return isDistrictMatch && rowMonth.toString() === month;
      });
    }

    let nivoData;

    if (dcode === "all") {
      const dailyAverage = new Map();
      const dailyCount = new Map();

      for (const row of filteredData) {
        const date = row.date;
        const risk = +row.RiskScore || 0;

        // (ปรับแก้) ตรวจสอบว่า date มีค่า (ไม่เป็น null, undefined, "")
        if (date) {
          dailyAverage.set(date, (dailyAverage.get(date) || 0) + risk);
          dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
        }
      }

      const aggregatedPoints = [];
      for (const [date, totalRisk] of dailyAverage.entries()) {
        const count = dailyCount.get(date);
        if (count > 0) {
          aggregatedPoints.push({
            x: date,
            y: totalRisk / count,
          });
        }
      }

      aggregatedPoints.sort((a, b) => new Date(a.x) - new Date(b.x));
      nivoData = [{ id: "Risk Score เฉลี่ยทุกเขต", data: aggregatedPoints }];
    } else {
      const points = filteredData
        // (ปรับแก้) กรอง row ที่ date ไม่มีค่าออก
        .filter((row) => row.date)
        .map((row) => ({
          x: row.date,
          y: row.RiskScore,
        }));

      points.sort((a, b) => new Date(a.x) - new Date(b.x));
      nivoData = [{ id: "Risk Score", data: points }];
    }

    return NextResponse.json(nivoData);
  } catch (error) {
    console.error("API [risk-scores] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
