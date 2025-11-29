import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 1. ดึงข้อมูลเขตพื้นฐาน (Master Data)
    const { data: districts, error: distError } = await supabase
      .from("districts")
      .select("*")
      .order("dname");

    if (distError) throw distError;

    // 2. ดึงข้อมูล Cluster ล่าสุด (ปี 2024) จากตารางใหม่ 'district_clusters'
    const { data: clusters, error: clusterError } = await supabase
      .from("district_clusters")
      .select("dcode, cluster, rain_load, pump_density")
      .eq("year", 2024);

    if (clusterError) throw clusterError;

    // สร้าง Map เพื่อให้ค้นหาข้อมูล Cluster ได้เร็วๆ (dcode -> data)
    const clusterMap = {};
    if (clusters) {
      clusters.forEach((c) => {
        clusterMap[c.dcode] = c;
      });
    }

    // 3. ดึงพยากรณ์อากาศ (L3 Prediction)
    const today = new Date().toISOString().split("T")[0];
    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true });

    // 4. ผสมข้อมูลทั้งหมดเข้าด้วยกัน (Merge)
    const merged = districts.map((d) => {
      const pred = predictions?.find((p) => p.dcode === d.dcode) || {};
      const clusterInfo = clusterMap[d.dcode] || { cluster: 2 }; // Default Low Risk

      // แปลง Cluster ID เป็นข้อความ (0=Well, 1=High, 2=Low)
      let structuralStatus = "Low Risk";
      if (clusterInfo.cluster === 1) structuralStatus = "High Risk";
      else if (clusterInfo.cluster === 0) structuralStatus = "Well Managed";

      // Vulnerability Score (คำนวณจากโครงสร้าง)
      // ปั๊มน้อย + จุดเสี่ยงเยอะ = เสี่ยงสูง
      const vulnerability = d.flood_point_count * 5 - d.pump_number * 0.8;

      return {
        ...d,
        // ข้อมูล L2 (Structural)
        vulnerability_score: vulnerability > 0 ? vulnerability : 0,
        structural_status: structuralStatus,
        cluster_id: clusterInfo.cluster,

        // ข้อมูล L3 (Forecast)
        forecast_status: pred.risk_level || "Low Risk",
        rain_load: pred.rain_load || 0,
        recommended_pumps: pred.recommended_pumps || 0,
      };
    });

    // 5. จัดอันดับความเสี่ยง (Ranking)
    const ranking = [...merged]
      .sort((a, b) => b.vulnerability_score - a.vulnerability_score)
      .slice(0, 10);

    // 6. สถิติสำหรับ Pie Chart (History/Structural)
    const historyStats = {
      high: merged.filter((d) => d.structural_status === "High Risk").length,
      med: merged.filter((d) => d.structural_status === "Well Managed").length,
      low: merged.filter((d) => d.structural_status === "Low Risk").length,
    };

    return NextResponse.json({ ranking, historyStats, allDistricts: merged });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
