import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// บังคับให้ทำงานแบบ Dynamic เสมอ (ไม่ Cache ข้อมูลเก่า)
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dcode = searchParams.get("dcode"); // รับรหัสเขต (ถ้ามี)
  const mode = searchParams.get("mode"); // รับโหมด (list หรือ analytics)

  try {
    // ----------------------------------------------------------------
    // MODE 1: LIST (สำหรับ Search Bar ในหน้า Dashboard ให้โหลดไวๆ)
    // ----------------------------------------------------------------
    if (mode === "list") {
      const { data: districts } = await supabase
        .from("districts")
        .select("dcode, dname, flood_point_count")
        .order("dname", { ascending: true });

      return NextResponse.json({ districts });
    }

    // ----------------------------------------------------------------
    // MODE 2: ANALYTICS (คำนวณความเสี่ยงและภาพรวมทั้งหมด)
    // ----------------------------------------------------------------

    // 1. ดึงข้อมูลเขตพื้นฐาน (Master Data) - *ไม่ดึง cluster จากตรงนี้แล้ว*
    const { data: districts, error: distError } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, canal_count, pump_number, pump_ready, flood_point_count"
      );

    if (distError) throw distError;

    // 2. ดึงข้อมูล Cluster ล่าสุด (ปี 2024) จากตารางใหม่
    const { data: clusters, error: clusterError } = await supabase
      .from("district_clusters")
      .select("dcode, cluster, rain_load, pump_density")
      .eq("year", 2024);

    // สร้าง Map เพื่อให้ค้นหา Cluster ของแต่ละเขตได้เร็วๆ
    const clusterMap = {};
    if (clusters) {
      clusters.forEach((c) => {
        clusterMap[c.dcode] = c;
      });
    }

    // 3. ดึงพยากรณ์ล่าสุด (L3 - ถ้ามี) เพื่อเอามาประกอบการตัดสินใจ
    const today = new Date().toISOString().split("T")[0];
    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true });

    // --- MERGE DATA & CALCULATE RISK ---
    const districtsWithRisk = districts.map((d) => {
      // ดึงข้อมูล Cluster (ถ้าไม่มีให้ Default เป็น 2 = Low Risk)
      const clusterInfo = clusterMap[d.dcode] || { cluster: 2 };
      const clusterId = clusterInfo.cluster;

      // ดึงข้อมูล Forecast
      const pred = predictions?.find((p) => p.dcode === d.dcode) || {};

      // --- สูตรคำนวณคะแนนความเสี่ยง (0-100) ---

      // 1. ปัจจัยน้ำท่วมในอดีต (สูงสุด 40 คะแนน)
      const floodScore = Math.min((d.flood_point_count || 0) * 5, 40);

      // 2. ปัจจัยความพร้อมปั๊ม (สูงสุด 30 คะแนน)
      // ถ้าปั๊มพร้อมใช้งานน้อยกว่า 80% ให้คะแนนเสี่ยงเพิ่ม
      let pumpScore = 0;
      if (d.pump_number > 0) {
        const readyRatio = (d.pump_ready || 0) / d.pump_number;
        if (readyRatio < 0.8) pumpScore = (1 - readyRatio) * 30;
      } else {
        pumpScore = 20; // ไม่มีปั๊มเลย เสี่ยงปานกลาง
      }

      // 3. ปัจจัยกลุ่ม Cluster (สูงสุด 30 คะแนน)
      let clusterScore = 0;
      if (clusterId === 1) clusterScore = 30; // High Risk Group (แดง)
      if (clusterId === 0) clusterScore = -10; // Well Managed (เขียว - ลดคะแนนเสี่ยง)

      // รวมคะแนน
      let totalScore = Math.round(floodScore + pumpScore + clusterScore);
      totalScore = Math.min(100, Math.max(0, totalScore)); // Clip ให้อยู่ 0-100

      // ตัดเกรดระดับความเสี่ยง
      let level = "Low";
      if (totalScore >= 60) level = "High";
      else if (totalScore >= 30) level = "Medium";

      return {
        ...d,
        cluster: clusterId, // ส่งค่า Cluster กลับไปให้ Frontend ใช้เลือกสี
        riskScore: totalScore,
        riskLevel: level,
        // ข้อมูลเสริมจากตารางอื่น
        rain_load: pred.rain_load || 0,
        recommended_pumps: pred.recommended_pumps || 0,
      };
    });

    // --- RESPONSE FORMATTING ---
    let responseData = {};

    if (dcode && dcode !== "null") {
      // >> Case A: ขอข้อมูลเจาะจงรายเขต (Detail Mode)
      const selectedDistrict = districtsWithRisk.find((d) => d.dcode == dcode);

      if (!selectedDistrict) {
        return NextResponse.json(
          { error: "District not found" },
          { status: 404 }
        );
      }

      // หาค่าเฉลี่ยของกลุ่ม (Peer Comparison) เพื่อทำกราฟ Radar
      const peers = districtsWithRisk.filter(
        (d) => d.cluster === selectedDistrict.cluster
      );
      const avgPump = peers.length
        ? peers.reduce((s, d) => s + d.pump_number, 0) / peers.length
        : 0;
      const avgCanal = peers.length
        ? peers.reduce((s, d) => s + d.canal_count, 0) / peers.length
        : 0;
      const avgRisk = peers.length
        ? peers.reduce((s, d) => s + d.riskScore, 0) / peers.length
        : 0;

      const radarData = [
        {
          feature: "จำนวนคลอง",
          value: selectedDistrict.canal_count,
          average: Math.round(avgCanal),
        },
        {
          feature: "จำนวนปั๊มน้ำ",
          value: selectedDistrict.pump_number,
          average: Math.round(avgPump),
        },
        {
          feature: "จุดเสี่ยงน้ำท่วม",
          value: selectedDistrict.flood_point_count,
          average: 5,
        }, // Benchmark กลางๆ
        {
          feature: "Risk Score",
          value: selectedDistrict.riskScore,
          average: Math.round(avgRisk),
        },
      ];

      responseData = { mode: "detail", district: selectedDistrict, radarData };
    } else {
      // >> Case B: ขอภาพรวมทั้ง กทม. (Overview Mode)

      // 1. Top 5 เขตเสี่ยงสูงสุด
      const topRisky = [...districtsWithRisk]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

      // 2. ข้อมูลสำหรับกราฟแท่ง (Top 10 เขตที่มีจุดเสี่ยงเยอะสุด)
      const floodGraphData = [...districts]
        .sort((a, b) => (b.flood_point_count || 0) - (a.flood_point_count || 0))
        .slice(0, 10)
        .map((d) => ({ dname: d.dname, floods: d.flood_point_count }));

      // 3. ข้อมูลสุขภาพระบบ (System Health)
      const totalPumps = districts.reduce(
        (s, d) => s + (d.pump_number || 0),
        0
      );
      const readyPumps = districts.reduce((s, d) => s + (d.pump_ready || 0), 0);
      const activePercent =
        totalPumps > 0 ? Math.round((readyPumps / totalPumps) * 100) : 0;

      responseData = {
        mode: "overview",
        mapData: districtsWithRisk, // ส่งไปให้แผนที่ระบายสี
        topRisky,
        floodGraphData,
        systemHealth: {
          totalDistricts: districts.length,
          activePumps: activePercent,
          highRiskCount: districtsWithRisk.filter((d) => d.riskLevel === "High")
            .length,
        },
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
