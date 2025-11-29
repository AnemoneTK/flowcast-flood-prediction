// src/app/api/dashboard-analytics/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dcode = searchParams.get("dcode");
  const mode = searchParams.get("mode"); // เพิ่ม parameter mode

  try {
    // 1. ถ้าขอแค่รายชื่อเขต (สำหรับ Dropdown)
    if (mode === "list") {
      const { data: districts } = await supabase
        .from("districts")
        .select("dcode, dname, flood_point_count")
        .order("dname", { ascending: true });

      return NextResponse.json({ districts });
    }

    // 2. ดึงข้อมูลหลัก
    const { data: districts, error } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, canal_count, pump_number, pump_ready, flood_point_count, cluster"
      );

    if (error) throw error;

    // คำนวณ Risk Score (Mock logic ให้ดูมีข้อมูล)
    const districtsWithRisk = districts.map((d) => ({
      ...d,
      riskScore: Math.min(
        100,
        Math.round(d.flood_point_count * 10 + Math.random() * 20)
      ), // ใส่สูตรจริงตรงนี้
      riskLevel:
        d.flood_point_count > 5
          ? "High"
          : d.flood_point_count > 2
          ? "Medium"
          : "Low",
    }));

    let responseData = {};

    if (dcode && dcode !== "null") {
      // --- Detail Mode ---
      const selectedDistrict = districtsWithRisk.find((d) => d.dcode == dcode);

      // ข้อมูล Radar Chart
      const radarData = [
        {
          feature: "คลองระบายน้ำ",
          value: selectedDistrict.canal_count,
          average: 25,
        },
        {
          feature: "ปั๊มน้ำ",
          value: selectedDistrict.pump_number,
          average: 10,
        },
        {
          feature: "ความเสี่ยง",
          value: selectedDistrict.riskScore,
          average: 40,
        },
      ];

      responseData = { mode: "detail", district: selectedDistrict, radarData };
    } else {
      // --- Overview Mode ---
      const topRisky = [...districtsWithRisk]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

      // ข้อมูลกราฟแท่ง (Top 10 เขตท่วมบ่อย)
      const floodGraphData = [...districts]
        .sort((a, b) => b.flood_point_count - a.flood_point_count)
        .slice(0, 10)
        .map((d) => ({ dname: d.dname, floods: d.flood_point_count }));

      responseData = {
        mode: "overview",
        mapData: districtsWithRisk, // เอาไป map สีในแผนที่
        topRisky,
        systemHealth: { maxRain: 120, activePumps: 85 },
        floodGraphData,
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
