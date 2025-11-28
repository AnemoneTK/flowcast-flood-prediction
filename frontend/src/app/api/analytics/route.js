import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 1. ดึงข้อมูลเขตทั้งหมด (Master Data)
    const { data: districts, error } = await supabase
      .from("districts")
      .select("*")
      .order("dname");
    if (error) throw error;

    // 2. ดึงพยากรณ์ล่าสุด (ถ้ามี)
    const today = new Date().toISOString().split("T")[0];
    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true });

    // 3. ผสมข้อมูล
    const merged = districts.map((d) => {
      const pred = predictions?.find((p) => p.dcode === d.dcode) || {};
      // Vulnerability Score (L2): (จุดเสี่ยง * 2) + (ประชากร/พื้นที่ * 0.01) - (ปั๊ม)
      // ปรับน้ำหนักให้สมจริงขึ้น
      const vulnerability = d.flood_point_count * 5 - d.pump_number * 0.8;

      return {
        ...d, // เอาข้อมูลเขตมาทั้งหมด (dname, area, etc.)
        vulnerability_score: vulnerability > 0 ? vulnerability : 0,
        risk_level: pred.risk_level || "Low Risk",
        rain_load: pred.rain_load || 0,
        recommended_pumps: pred.recommended_pumps || 0,
      };
    });

    // 4. จัดอันดับความเสี่ยง (Ranking)
    const ranking = [...merged]
      .sort((a, b) => b.vulnerability_score - a.vulnerability_score)
      .slice(0, 10);

    // 5. สถิติสำหรับ Pie Chart (History/Structural)
    // นับจากความเปราะบาง (เช่น ถ้า flood_points > 5 ถือว่าเสี่ยงสูงในเชิงโครงสร้าง)
    const historyStats = {
      high: merged.filter((d) => d.flood_point_count >= 5).length,
      med: merged.filter(
        (d) => d.flood_point_count >= 1 && d.flood_point_count < 5
      ).length,
      low: merged.filter((d) => d.flood_point_count === 0).length,
    };

    return NextResponse.json({ ranking, historyStats, allDistricts: merged });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
