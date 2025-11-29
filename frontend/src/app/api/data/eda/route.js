import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 1. ดึงข้อมูล Static (Districts) -> สำหรับ Raw Data (Area, Pump Count)
    const { data: districts } = await supabase.from("districts").select("*");

    // 2. ดึงข้อมูลฝนรวมรายปี (RPC) -> สำหรับ Raw Data (Total Rain)
    const { data: rainStats } = await supabase.rpc("get_annual_rain_stats");

    // 3. ดึงข้อมูล Engineered (District Clusters) -> สำหรับ Engineered Data
    const { data: clusters } = await supabase
      .from("district_clusters")
      .select("*");

    // Helper function เพื่อประกอบร่างข้อมูล
    const buildYearData = (targetYear) => {
      // กรองข้อมูลตามปี
      const yearClusters = clusters?.filter((c) => c.year === targetYear) || [];
      const yearRain = rainStats?.filter((r) => r.year === targetYear) || [];

      // สร้าง Map เพื่อความเร็ว
      const rainMap = {};
      yearRain.forEach((r) => (rainMap[r.dcode] = r.total_rain));

      const engMap = {};
      yearClusters.forEach((c) => (engMap[c.dcode] = c));

      // Map เข้ากับ District หลัก
      const data = districts.map((d) => {
        const totalRain = rainMap[d.dcode] || 0;
        const eng = engMap[d.dcode] || {};

        return {
          dcode: d.dcode,
          dname: d.dname,
          // --- RAW (Before) ---
          raw: {
            rain_total: totalRain,
            pump_number: d.pump_number,
            area: d.area,
            season: "Mixed", // ข้อมูลรายปีคือรวมทุกฤดู
          },
          // --- ENGINEERED (After) ---
          eng: {
            rain_load: eng.rain_load || totalRain / Math.max(d.pump_number, 1), // ถ้าไม่มีใน DB ก็คำนวณสด
            pump_density: eng.pump_density || d.pump_number / d.area,
            cluster: eng.cluster,
            season_code: "0,1,2", // Encoded
          },
        };
      });

      return data;
    };

    return NextResponse.json({
      year2023: buildYearData(2023),
      year2024: buildYearData(2024),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
