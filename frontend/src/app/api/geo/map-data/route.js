import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // ดึงข้อมูลจาก View ที่มี GeoJSON และ Cluster แล้ว
    const { data, error } = await supabase
      .from("view_districts_geojson")
      .select("*");

    if (error) throw error;

    // แปลง Format ให้ Frontend ใช้ง่าย (GeoJSON FeatureCollection)
    const features = data.map((d) => ({
      type: "Feature",
      properties: {
        dcode: d.dcode,
        dname: d.dname,
        cluster: d.cluster, // 0, 1, 2 (ใช้กำหนดสีบนแผนที่)
        area: d.area,
        population: d.population,
      },
      geometry: d.geometry, // GeoJSON object
    }));

    return NextResponse.json({
      type: "FeatureCollection",
      features: features,
    });
  } catch (error) {
    console.error("Map Data Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
