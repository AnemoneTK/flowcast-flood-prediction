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
  const mode = searchParams.get("mode");

  try {
    // --- MODE 1: สำหรับ Dropdown ค้นหา (โหลดไวๆ) ---
    if (mode === "list") {
      const { data: districts, error } = await supabase
        .from("districts")
        .select("dcode, dname, flood_point_count")
        .order("dname", { ascending: true });

      if (error) throw error;

      // ส่งกลับเป็น Array ตรงๆ เพื่อให้ Frontend ใช้ง่ายที่สุด
      return NextResponse.json(districts);
    }

    // --- MODE 2: สำหรับ Dashboard Analytics (คำนวณหนัก) ---
    const { data: districts, error } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, canal_count, pump_number, pump_ready, flood_point_count, cluster"
      );

    if (error) throw error;

    // คำนวณ Risk Score แบบไม่สุ่ม (ใช้ข้อมูลจริง)
    const districtsWithRisk = districts.map((d) => {
      // 1. คะแนนจากประวัติน้ำท่วม (ท่วมเยอะ = เสี่ยงเยอะ)
      // สมมติ max flood points คือ 20 จุด ให้คะแนนเต็ม 100
      const floodScore = Math.min(((d.flood_point_count || 0) / 20) * 100, 100);

      // 2. คะแนนจากปั๊มน้ำ (เสียน้อย = เสี่ยงน้อย, เสียเยอะ = เสี่ยงเยอะ)
      let pumpRisk = 0;
      if (d.pump_number > 0) {
        const brokenRatio = 1 - (d.pump_ready || 0) / d.pump_number;
        pumpRisk = brokenRatio * 100;
      }

      // สูตรถ่วงน้ำหนัก: ประวัติ 70% + สภาพปั๊ม 30%
      const totalRisk = Math.round(floodScore * 0.7 + pumpRisk * 0.3);

      let level = "Low";
      if (totalRisk >= 60) level = "High";
      else if (totalRisk >= 30) level = "Medium";

      return { ...d, riskScore: totalRisk, riskLevel: level };
    });

    // Response Logic
    if (dcode && dcode !== "null") {
      // Detail View
      const selected = districtsWithRisk.find((d) => d.dcode == dcode);
      const radarData = [
        {
          feature: "จุดเสี่ยงน้ำท่วม",
          value: selected.flood_point_count || 0,
          average: 5,
        },
        { feature: "จำนวนคลอง", value: selected.canal_count || 0, average: 15 },
        {
          feature: "ปั๊มพร้อมใช้งาน",
          value: selected.pump_ready || 0,
          average: 8,
        },
      ];
      return NextResponse.json({
        mode: "detail",
        district: selected,
        radarData,
      });
    } else {
      // Overview View
      const topRisky = [...districtsWithRisk]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

      const floodGraphData = [...districts]
        .sort((a, b) => (b.flood_point_count || 0) - (a.flood_point_count || 0))
        .slice(0, 10)
        .map((d) => ({ dname: d.dname, floods: d.flood_point_count }));

      return NextResponse.json({
        mode: "overview",
        topRisky,
        mapData: districtsWithRisk,
        systemHealth: { maxRain: 0, activePumps: 85 }, // Mock Rain จนกว่าจะมีตารางจริง
        floodGraphData,
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
