// frontend/src/app/api/geo/map-data/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // 1. ดึงข้อมูลเขต (GeoJSON View)
    const { data: districtsData, error: distError } = await supabase
      .from("view_districts_geojson")
      .select("*");
    if (distError) throw distError;

    // 2. ดึงข้อมูล Cluster (ความเสี่ยง) ล่าสุด
    const { data: clusters, error: clusterError } = await supabase
      .from("district_clusters")
      .select("dcode, cluster")
      .eq("year", 2024); // หรือปีล่าสุดที่คุณใช้

    // สร้าง Map เพื่อจับคู่ dcode -> cluster
    const clusterMap = {};
    if (clusters) {
      clusters.forEach((c) => {
        clusterMap[c.dcode] = c.cluster;
      });
    }

    // 3. ดึงข้อมูลจุดเสี่ยง
    const { data: pointsData, error: pointError } = await supabase
      .from("view_floodpoints_geojson")
      .select("*");

    // 4. ดึงข้อมูลปั๊มน้ำ
    const { data: pumpsData, error: pumpError } = await supabase
      .from("geo_pumps")
      .select("pump_id, name, dcode, location");

    // --- แปลงข้อมูลเป็น GeoJSON Features ---

    // Feature 1: เขต (Districts) + ใส่สี Cluster
    const districtFeatures = districtsData
      .filter((row) => row.geometry)
      .map((row) => ({
        type: "Feature",
        properties: {
          dcode: row.dcode,
          dname: row.dname,
          // ใส่ค่า Cluster ที่ดึงมาได้ (ถ้าไม่มีให้เป็น 0)
          cluster:
            clusterMap[row.dcode] !== undefined ? clusterMap[row.dcode] : 0,
          flood_count: row.flood_point_count,
        },
        geometry: row.geometry,
      }));

    // Feature 2: จุดเสี่ยง (Flood Points)
    const pointFeatures = (pointsData || [])
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

    // Feature 3: ปั๊มน้ำ (Pumps)
    const pumpFeatures = (pumpsData || [])
      .filter((row) => row.location)
      .map((row) => {
        try {
          // แปลง string location เป็น object (ถ้าจำเป็น)
          const geom =
            typeof row.location === "string"
              ? JSON.parse(row.location)
              : row.location;
          return {
            type: "Feature",
            properties: {
              id: row.pump_id,
              name: row.name,
              dcode: row.dcode,
              type: "pump_station",
            },
            geometry: geom,
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      districts: { type: "FeatureCollection", features: districtFeatures },
      riskPoints: { type: "FeatureCollection", features: pointFeatures },
      pumps: { type: "FeatureCollection", features: pumpFeatures },
    });
  } catch (err) {
    console.error("Map API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
