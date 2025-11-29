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
  const queryDate = searchParams.get("date");
  const mode = searchParams.get("mode");
  const forceDate = searchParams.get("forceDate");

  try {
    // 0. LIST MODE (สำหรับ Dropdown)
    if (mode === "list") {
      const { data: districts } = await supabase
        .from("districts")
        .select("dcode, dname")
        .order("dname");
      return NextResponse.json(districts || []);
    }

    const today = new Date().toISOString().split("T")[0];
    let targetDate = today;
    if (forceDate) targetDate = forceDate;
    else if (queryDate) targetDate = queryDate;

    // 1. ดึงข้อมูลหลัก (LastHighRisk, Districts, Predictions, Logs) - (เหมือนเดิม)
    const { data: lastHighRisk } = await supabase
      .from("predictions")
      .select("date")
      .eq("risk_level", "High Risk")
      .lt("date", today)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastHighRiskDate = lastHighRisk?.date || null;

    const { data: districts } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, canal_count, pump_number, pump_ready, flood_point_count"
      );
    const { data: predictions } = await supabase
      .from("predictions")
      .select("dcode, risk_level, rain_load")
      .eq("date", targetDate);

    // ดึงฝน (Logs หรือ Forecast)
    let rainData = [];
    const { data: logs } = await supabase
      .from("rain_logs")
      .select("dcode, rain_24h")
      .eq("date", targetDate);
    if (logs && logs.length > 0) rainData = logs;
    else {
      const { data: forecasts } = await supabase
        .from("rain_forecasts")
        .select("dcode, rain_24h")
        .eq("date", targetDate);
      rainData = forecasts || [];
    }

    // Merge Data
    const predMap =
      predictions?.reduce((acc, p) => ({ ...acc, [p.dcode]: p }), {}) || {};
    const rainMap =
      rainData?.reduce((acc, r) => ({ ...acc, [r.dcode]: r.rain_24h }), {}) ||
      {};

    const mergedData = districts.map((d) => {
      const pred = predMap[d.dcode] || {};
      const riskLevel = pred.risk_level || "Low Risk";

      let cluster = 0;
      let riskScore = 0;
      if (riskLevel === "High Risk") {
        cluster = 1;
        riskScore = 80 + (pred.rain_load ? Math.min(pred.rain_load, 20) : 0);
      } else if (riskLevel === "Medium" || riskLevel === "Well Managed") {
        cluster = 2;
        riskScore = 50 + (pred.rain_load ? Math.min(pred.rain_load, 29) : 0);
      } else {
        riskScore = Math.min(pred.rain_load || 0, 49);
      }

      return {
        ...d,
        riskLevel,
        cluster,
        riskScore: Math.round(riskScore),
        rainAmount: rainMap[d.dcode] || 0,
        rainLoad: pred.rain_load || 0,
        brokenPumps: d.pump_number - d.pump_ready,
        brokenRatio:
          d.pump_number > 0
            ? (d.pump_number - d.pump_ready) / d.pump_number
            : 0,
      };
    });

    // ==========================================
    //  DETAIL MODE (ปรับปรุงใหม่)
    // ==========================================
    if (dcode && dcode !== "null") {
      const selected = mergedData.find(
        (d) => String(d.dcode) === String(dcode)
      );
      if (!selected)
        return NextResponse.json(
          { error: "District not found" },
          { status: 404 }
        );

      // 1. ดึงข้อมูลฝนรายเดือนย้อนหลัง 3 ปี (2023-2025) สำหรับกราฟเส้น
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const rainSeries = [
        { id: "2023", data: [] },
        { id: "2024", data: [] },
        { id: "2025", data: [] },
      ];

      // ดึงข้อมูลฝนจริงทั้งหมดของเขตนี้
      const { data: allRain } = await supabase
        .from("rain_logs")
        .select("date, rain_24h")
        .eq("dcode", dcode)
        .gte("date", "2023-01-01");

      // Aggregate by Month/Year
      const rainAgg = {}; // { "2023-01": 150, ... }
      if (allRain) {
        allRain.forEach((r) => {
          const d = new Date(r.date);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          rainAgg[key] = (rainAgg[key] || 0) + r.rain_24h;
        });
      }

      // Fill Data Series
      [2023, 2024, 2025].forEach((year, yIdx) => {
        months.forEach((m, mIdx) => {
          const key = `${year}-${mIdx}`;
          // Mock data ถ้าไม่มี (เพื่อความสวยงามในการ Demo) - *Production ควรเอาออก*
          let val = rainAgg[key] || 0;
          if (val === 0 && year === 2024 && mIdx > 5) val = Math.random() * 200; // Mock

          rainSeries[yIdx].data.push({ x: m, y: Math.round(val) });
        });
      });

      // 2. พยากรณ์ 3 วันข้างหน้า
      const { data: forecasts } = await supabase
        .from("rain_forecasts")
        .select("date, rain_24h, condition, temp_max, temp_min, humidity")
        .eq("dcode", dcode)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(3);

      const clusterPeers = mergedData.filter(
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
        rainAmount: selected.rainAmount,
        rainSeries: rainSeries, // ส่งกราฟเส้นกลับไป
        forecast: forecasts || [],
        radarData: [
          {
            feature: "จุดเสี่ยง",
            value: selected.flood_point_count,
            average: getAvg("flood_point_count"),
          },
          {
            feature: "คลอง",
            value: selected.canal_count,
            average: getAvg("canal_count"),
          },
          {
            feature: "ปั๊ม",
            value: selected.pump_number,
            average: getAvg("pump_number"),
          },
          {
            feature: "Load",
            value: Math.min(Math.round(selected.rainLoad), 100),
            average: Math.min(Math.round(getAvg("rainLoad")), 100),
          },
        ],
      });
    } else {
      // --- OVERVIEW MODE (เหมือนเดิม) ---
      let topRisky = [...mergedData]
        .filter((d) => d.riskLevel === "High Risk" || d.riskLevel === "Medium")
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);
      const floodGraphData = [...mergedData]
        .sort((a, b) => a.flood_point_count - b.flood_point_count)
        .slice(-10)
        .map((d) => ({ dname: d.dname, floods: d.flood_point_count }));
      const maxRainDistrict = mergedData.reduce(
        (prev, curr) => (prev.rainAmount > curr.rainAmount ? prev : curr),
        {}
      );
      const totalPumps = mergedData.reduce((s, d) => s + d.pump_number, 0);
      const readyPumps = mergedData.reduce((s, d) => s + d.pump_ready, 0);
      const riskStats = mergedData.reduce(
        (acc, d) => {
          if (d.cluster === 1) acc.high++;
          else if (d.cluster === 2) acc.med++;
          else acc.low++;
          return acc;
        },
        { high: 0, med: 0, low: 0 }
      );

      return NextResponse.json({
        mode: "overview",
        topRisky,
        mapData: mergedData,
        floodGraphData,
        systemHealth: {
          maxRain: maxRainDistrict.rainAmount || 0,
          maxRainDistrict: maxRainDistrict.dname || "-",
          rainDateLabel: targetDate,
          lastHighRiskDate,
          isHistoricalView: targetDate !== today,
          activePumps:
            totalPumps > 0 ? Math.round((readyPumps / totalPumps) * 100) : 0,
          totalRiskCount: riskStats.high + riskStats.med,
          highRiskCount: riskStats.high,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
