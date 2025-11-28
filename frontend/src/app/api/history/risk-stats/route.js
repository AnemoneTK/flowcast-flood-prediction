import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2024"; // Default ปี 2024
  const dcode = searchParams.get("dcode"); // ถ้าไม่ส่งมา คือเอาทุกเขต

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 1. ดึงข้อมูลฝนตามปีที่เลือก
    let query = supabase
      .from("rain_logs")
      .select("date, rain_24h, dcode")
      .eq("is_forecast", false)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);

    if (dcode) {
      query = query.eq("dcode", dcode);
    }

    const { data: rainData, error: rainError } = await query;
    if (rainError) throw rainError;

    // 2. ดึงข้อมูลเขต (เพื่อเอาจำนวนปั๊มมาคำนวณ)
    const { data: districtData } = await supabase.from("districts").select("*");
    const districtMap = {};
    districtData.forEach((d) => {
      districtMap[d.dcode] = d;
    });

    // 3. คำนวณความเสี่ยงรายวัน (Replay History)
    const riskEvents = [];
    const districtStats = {}; // เก็บสถิติรายเขต (ท่วมกี่ครั้ง)

    rainData.forEach((row) => {
      const dist = districtMap[row.dcode];
      if (!dist) return;

      // สูตร L2: Rain Load Calculation
      const pumpSafe = Math.max(dist.pump_number, 1);
      const rainLoad = row.rain_24h / pumpSafe;

      // Threshold สมมติ: > 100 คือ "เสี่ยงท่วม" (High Risk Event)
      const isHighRisk = rainLoad > 100;

      // เก็บสถิติ
      if (!districtStats[row.dcode]) {
        districtStats[row.dcode] = {
          dname: dist.dname,
          highRiskCount: 0,
          totalRain: 0,
          maxRain: 0,
        };
      }
      districtStats[row.dcode].totalRain += row.rain_24h;
      if (row.rain_24h > districtStats[row.dcode].maxRain)
        districtStats[row.dcode].maxRain = row.rain_24h;

      if (isHighRisk) {
        districtStats[row.dcode].highRiskCount++;
      }

      // เก็บรายละเอียดรายวัน (เฉพาะถ้าเลือกเขตมา หรือ เฉพาะวันที่เสี่ยงสูงเพื่อลดขนาดข้อมูล)
      if (dcode || isHighRisk) {
        riskEvents.push({
          date: row.date,
          dcode: row.dcode,
          dname: dist.dname,
          rain_24h: row.rain_24h,
          pump_number: dist.pump_number,
          canal_count: dist.canal_count,
          rain_load: rainLoad,
          is_high_risk: isHighRisk,
        });
      }
    });

    // 4. จัดอันดับ (L1 - เขตไหนท่วมบ่อยสุด)
    const ranking = Object.values(districtStats)
      .sort((a, b) => b.highRiskCount - a.highRiskCount)
      .slice(0, 10); // Top 10

    return NextResponse.json({
      year,
      ranking,
      events: riskEvents, // รายการวันที่เกิดเหตุ
      districtStats: dcode ? districtStats[dcode] : null, // สถิติของเขตที่เลือก
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
