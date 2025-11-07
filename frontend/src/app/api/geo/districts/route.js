// frontend/src/app/api/geo/districts/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";
import wellknown from "wellknown"; // Import WKT parser

const CSV_PATH = path.resolve(
  process.cwd(),
  "public",
  "data",
  "master_district_features.csv"
);

export async function GET() {
  try {
    const fileContent = await fs.readFile(CSV_PATH, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const features = parsed.data
      .map((row) => {
        if (!row.geometry) return null;
        try {
          // (สำคัญ) ตอนนี้ row.geometry คือ WKT ของ Lat/Lon แล้ว
          const geojson = wellknown.parse(row.geometry);
          return {
            type: "Feature",
            geometry: geojson,
            properties: {
              dcode: row.dcode,
              dname: row.dname,
            },
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      type: "FeatureCollection",
      features: features,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process district geometry", details: error.message },
      { status: 500 }
    );
  }
}
