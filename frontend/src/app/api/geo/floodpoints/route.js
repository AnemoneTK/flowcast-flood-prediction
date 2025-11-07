// frontend/src/app/api/geo/floodpoints/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Papa from "papaparse";
import wellknown from "wellknown";

const CSV_PATH = path.resolve(
  process.cwd(),
  "public",
  "data",
  "flood_points.csv"
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
          const geojson = wellknown.parse(row.geometry); // แปลง WKT (POINT)
          return {
            type: "Feature",
            geometry: geojson,
            properties: {
              dcode: row.dcode,
              name: row.location, // ใช้คอลัมน์ 'location'
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
      { error: "Failed to process flood points", details: error.message },
      { status: 500 }
    );
  }
}
