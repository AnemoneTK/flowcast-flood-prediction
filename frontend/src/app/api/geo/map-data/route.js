// src/app/api/geo/map-data/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // 1. ดึงข้อมูลเขตจาก View ใหม่
    const { data: districtsData, error: distError } = await supabase
      .from("view_districts_geojson")
      .select("*");

    if (distError) throw distError;

    // 2. ดึงข้อมูลจุดเสี่ยง
    const { data: pointsData, error: pointError } = await supabase
      .from("view_floodpoints_geojson")
      .select("*");

    if (pointError) throw pointError;

    // 3. แปลงเป็น GeoJSON Format
    const districtFeatures = districtsData
      .filter((row) => row.geometry) // กรองข้อมูลที่ไม่มีพิกัดออก
      .map((row) => ({
        type: "Feature",
        properties: {
          dcode: row.dcode,
          dname: row.dname,
          cluster: row.cluster, // ✅ ส่งค่า Cluster (0,1,2) ไปให้ Frontend
          flood_count: row.flood_point_count,
        },
        geometry: row.geometry,
      }));

    const pointFeatures = pointsData
      .filter((row) => row.geometry)
      .map((row) => ({
        type: "Feature",
        properties: {
          id: row.id,
          name: row.location_name,
          dcode: row.dcode,
          type: "risk_point",
        },
        geometry: row.geometry,
      }));

    return NextResponse.json({
      districts: { type: "FeatureCollection", features: districtFeatures },
      riskPoints: { type: "FeatureCollection", features: pointFeatures },
    });
  } catch (err) {
    console.error("Map API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
