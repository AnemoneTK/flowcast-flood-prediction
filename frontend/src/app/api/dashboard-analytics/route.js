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
    if (mode === "list") {
      const { data: districts } = await supabase
        .from("districts")
        .select("dcode, dname, flood_point_count")
        .order("dname", { ascending: true });
      return NextResponse.json(districts || []);
    }

    // 1. ดึงข้อมูลเขต
    const { data: districts, error: distError } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, canal_count, pump_number, pump_ready, flood_point_count"
      );

    if (distError) throw distError;

    // 2. ดึง Cluster
    const { data: clusters } = await supabase
      .from("district_clusters")
      .select("dcode, cluster")
      .eq("year", 2024);

    const clusterMap = {};
    if (clusters)
      clusters.forEach((c) => {
        clusterMap[c.dcode] = c.cluster;
      });

    const districtsWithCluster = districts.map((d) => ({
      ...d,
      cluster: clusterMap[d.dcode] ?? 0,
    }));

    // --- Helper: ดึงข้อมูลฝน (Smart Fallback) ---
    const getRainData = async (table, dateOffset = 0, specificDcode = null) => {
      const date = new Date();
      date.setDate(date.getDate() + dateOffset);
      const dateStr = date.toISOString().split("T")[0];

      let query = supabase
        .from(table)
        .select(`rain_24h, dcode, districts(dname)`)
        .eq("date", dateStr);

      if (specificDcode) {
        // ถ้าระบุเขต ให้หาเฉพาะเขตนั้น
        query = query.eq("dcode", specificDcode).maybeSingle();
      } else {
        // ถ้าไม่ระบุ ให้หาค่าสูงสุด (Max)
        query = query
          .order("rain_24h", { ascending: false })
          .limit(1)
          .maybeSingle();
      }

      const { data } = await query;
      return data
        ? {
            ...data,
            date: dateStr,
            type: table === "rain_logs" ? "จริง" : "พยากรณ์",
          }
        : null;
    };

    // 3. Risk Calculation
    const districtsWithRisk = districtsWithCluster.map((d) => {
      const floodScore = Math.min(((d.flood_point_count || 0) / 10) * 100, 100);
      let pumpRisk =
        d.pump_number > 0
          ? (1 - (d.pump_ready || 0) / d.pump_number) * 100
          : 50;
      const totalRisk = Math.round(floodScore * 0.8 + pumpRisk * 0.2);

      let level = "Low";
      if (totalRisk >= 60) level = "High";
      else if (totalRisk >= 30) level = "Medium";

      return { ...d, riskScore: totalRisk, riskLevel: level };
    });

    // ==========================================
    //  RESPONSE HANDLER
    // ==========================================
    if (dcode && dcode !== "null") {
      // --- DETAIL MODE ---
      const selected = districtsWithRisk.find(
        (d) => String(d.dcode) === String(dcode)
      );
      if (!selected)
        return NextResponse.json(
          { error: "District not found" },
          { status: 404 }
        );

      // ** หาข้อมูลฝนเฉพาะเขตนี้ **
      let districtRain = await getRainData("rain_logs", 0, dcode);
      if (!districtRain)
        districtRain = await getRainData("rain_forecasts", 0, dcode);
      if (!districtRain)
        districtRain = await getRainData("rain_logs", -1, dcode);
      if (!districtRain)
        districtRain = await getRainData("rain_forecasts", 1, dcode);

      const clusterPeers = districtsWithRisk.filter(
        (d) => d.cluster === selected.cluster
      );
      const getAvg = (field) =>
        Math.round(
          clusterPeers.reduce((s, d) => s + (d[field] || 0), 0) /
            (clusterPeers.length || 1)
        );

      return NextResponse.json({
        mode: "detail",
        district: selected,
        rainAmount: districtRain?.rain_24h || 0, // ส่งค่าฝนกลับไป
        rainDate: districtRain ? `(${districtRain.date})` : "",
        radarData: [
          {
            feature: "จุดเสี่ยงน้ำท่วม",
            value: selected.flood_point_count || 0,
            average: getAvg("flood_point_count"),
          },
          {
            feature: "จำนวนคลอง",
            value: selected.canal_count || 0,
            average: getAvg("canal_count"),
          },
          {
            feature: "ปั๊มน้ำติดตั้ง",
            value: selected.pump_number || 0,
            average: getAvg("pump_number"),
          },
        ],
      });
    } else {
      // --- OVERVIEW MODE ---
      // หาฝนสูงสุดภาพรวม
      let maxRainInfo = await getRainData("rain_logs", 0);
      if (!maxRainInfo) maxRainInfo = await getRainData("rain_forecasts", 0);
      if (!maxRainInfo) maxRainInfo = await getRainData("rain_logs", -1);
      if (!maxRainInfo) maxRainInfo = await getRainData("rain_forecasts", 1);

      const topRisky = [...districtsWithRisk]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);
      const floodGraphData = [...districtsWithRisk]
        .sort((a, b) => (b.flood_point_count || 0) - (a.flood_point_count || 0))
        .slice(0, 10)
        .map((d) => ({ dname: d.dname, floods: d.flood_point_count }));

      const totalPumps = districtsWithRisk.reduce(
        (s, d) => s + (d.pump_number || 0),
        0
      );
      const readyPumps = districtsWithRisk.reduce(
        (s, d) => s + (d.pump_ready || 0),
        0
      );

      return NextResponse.json({
        mode: "overview",
        topRisky,
        mapData: districtsWithRisk,
        systemHealth: {
          maxRain: maxRainInfo?.rain_24h || 0,
          maxRainDistrict:
            maxRainInfo?.rain_24h > 0 && maxRainInfo?.districts?.dname
              ? maxRainInfo.districts.dname
              : "-",
          rainDateLabel: maxRainInfo
            ? `(${maxRainInfo.date} ${maxRainInfo.type})`
            : "",
          activePumps:
            totalPumps > 0 ? Math.round((readyPumps / totalPumps) * 100) : 0,
        },
        floodGraphData,
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
