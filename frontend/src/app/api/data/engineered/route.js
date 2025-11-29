// src/app/api/data/engineered/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // ดึงข้อมูลที่ Feature Engineer แล้ว (รวมปี 2023 และ 2024)
    const { data, error } = await supabase
      .from("district_clusters")
      .select(
        `
        dcode,
        year,
        cluster,
        rain_load,
        pump_density,
        pc1,
        pc2,
        districts (dname)
      `
      )
      // เรียงตามปีล่าสุดก่อน แล้วตามด้วย Cluster
      .order("year", { ascending: false })
      .order("cluster", { ascending: true });

    if (error) throw error;

    // จัด Format ข้อมูลให้แบนราบ (Flatten) เพื่อแสดงผลในตารางง่ายขึ้น
    const formattedData = data.map((item) => ({
      dcode: item.dcode,
      dname: item.districts?.dname,
      year: item.year,
      rain_load: item.rain_load,
      pump_density: item.pump_density,
      pc1: item.pc1,
      pc2: item.pc2,
      cluster: item.cluster,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
