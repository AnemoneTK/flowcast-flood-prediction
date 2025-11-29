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
  const isMock = searchParams.get("mock") === "true"; // รับค่า Mock Mode

  try {
    // 0. LIST MODE (สำหรับ Dropdown)
    if (mode === "list") {
      const { data: districts } = await supabase
        .from("districts")
        .select("dcode, dname")
        .order("dname");
      return NextResponse.json(districts || []);
    }

    // 1. ดึงข้อมูลพื้นฐานเขต
    const { data: districts } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, canal_count, pump_number, pump_ready, flood_point_count"
      );

    let mergedData = [];
    let targetDate = queryDate || new Date().toISOString().split("T")[0];
    let lastHighRiskDate = null;

    // ==================================================
    // 🔴 MOCK MODE: สร้างข้อมูลจำลอง (Extreme Scenario)
    // ==================================================
    if (isMock) {
      targetDate = "SIMULATION-NOW";

      mergedData = districts.map((d) => {
        // สุ่มความเสี่ยง: 20% วิกฤตหนัก, 30% เฝ้าระวัง
        const rand = Math.random();
        const isCritical = rand < 0.2;
        const isWatch = !isCritical && rand < 0.5;

        let mockRain = 0;
        let mockRiskLevel = "Low Risk";
        let mockCluster = 0;
        let mockBroken = 0;
        let calculatedScore = 0;

        if (isCritical) {
          mockRiskLevel = "High Risk";
          mockCluster = 1;
          // ฝนตกหนักมาก (200 - 450 mm)
          mockRain = 200 + Math.floor(Math.random() * 250);
          // ปั๊มเสียเยอะ (40% - 80%)
          mockBroken = Math.floor(d.pump_number * (0.4 + Math.random() * 0.4));
          // Score สูงลิ่ว (85 - 100)
          calculatedScore = 85 + Math.floor(Math.random() * 15);
        } else if (isWatch) {
          mockRiskLevel = "Medium";
          mockCluster = 2;
          // ฝนปานกลางถึงหนัก (80 - 199 mm)
          mockRain = 80 + Math.floor(Math.random() * 120);
          // ปั๊มเสียนิดหน่อย (10% - 30%)
          mockBroken = Math.floor(d.pump_number * (0.1 + Math.random() * 0.2));
          // Score ปานกลาง (50 - 84)
          calculatedScore = 50 + Math.floor(Math.random() * 34);
        } else {
          // ฝนน้อย (0 - 50 mm)
          mockRain = Math.floor(Math.random() * 50);
          mockBroken = 0; // ปั๊มปกติ
          // Score ต่ำ (0 - 49)
          calculatedScore = Math.floor(Math.random() * 49);
        }

        return {
          ...d,
          riskLevel: mockRiskLevel,
          cluster: mockCluster,
          riskScore: calculatedScore, // ใช้ค่านี้ในการจัดอันดับ
          rainAmount: mockRain,
          rainLoad: mockRain / Math.max(d.pump_number - mockBroken, 1), // คำนวณ Load จริงจากปั๊มที่เหลือ
          pump_ready: Math.max(0, d.pump_number - mockBroken), // Override ค่าปั๊มพร้อมใช้
          brokenPumps: mockBroken,
          isMock: true,
        };
      });

      // เรียงลำดับข้อมูลทั้งหมดตาม Risk Score จากมากไปน้อยทันที เพื่อความชัวร์
      mergedData.sort((a, b) => b.riskScore - a.riskScore);
    }
    // ==================================================
    // 🟢 REAL MODE: ข้อมูลจริงจาก DB
    // ==================================================
    else {
      if (forceDate) targetDate = forceDate;

      const { data: lastHigh } = await supabase
        .from("predictions")
        .select("date")
        .eq("risk_level", "High Risk")
        .lt("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      lastHighRiskDate = lastHigh?.date || null;

      const { data: predictions } = await supabase
        .from("predictions")
        .select("dcode, risk_level, rain_load")
        .eq("date", targetDate);

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

      const predMap =
        predictions?.reduce((acc, p) => ({ ...acc, [p.dcode]: p }), {}) || {};
      const rainMap =
        rainData?.reduce((acc, r) => ({ ...acc, [r.dcode]: r.rain_24h }), {}) ||
        {};

      mergedData = districts.map((d) => {
        const pred = predMap[d.dcode] || {};
        let riskLevel = pred.risk_level || "Low Risk";
        if (riskLevel === "Well Managed") riskLevel = "Medium";

        let cluster = 0;
        let riskScore = 0;
        if (riskLevel === "High Risk") {
          cluster = 1;
          riskScore = 80 + (pred.rain_load ? Math.min(pred.rain_load, 20) : 0);
        } else if (riskLevel === "Medium") {
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
          pump_ready: d.pump_ready,
          brokenPumps: d.pump_number - d.pump_ready,
        };
      });
    }

    // ==========================================
    //  RESPONSE GENERATION
    // ==========================================

    if (dcode && dcode !== "null") {
      // --- DETAIL MODE ---
      const selected = mergedData.find(
        (d) => String(d.dcode) === String(dcode)
      );
      if (!selected)
        return NextResponse.json(
          { error: "District not found" },
          { status: 404 }
        );

      // 1. Rainfall History (3 Years)
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
      const rainSeries = [];

      if (isMock) {
        // ✅ Mock History: กราฟพุ่งสูง
        [2023, 2024, 2025].forEach((year) => {
          rainSeries.push({
            id: String(year),
            data: months.map((m) => ({
              x: m,
              y: Math.floor(Math.random() * 400),
            })), // 0-400mm
          });
        });
      } else {
        // ✅ Real History
        const { data: allRain } = await supabase
          .from("rain_logs")
          .select("date, rain_24h")
          .eq("dcode", dcode)
          .gte("date", "2023-01-01");
        const rainAgg = {};
        if (allRain)
          allRain.forEach((r) => {
            const d = new Date(r.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            rainAgg[key] = (rainAgg[key] || 0) + r.rain_24h;
          });

        [2023, 2024, 2025].forEach((year) => {
          rainSeries.push({
            id: String(year),
            data: months.map((m, mIdx) => ({
              x: m,
              y: Math.round(rainAgg[`${year}-${mIdx}`] || 0),
            })),
          });
        });
      }

      // 2. Forecasts
      let forecasts = [];
      if (isMock) {
        // ✅ Mock Forecast: ฝนตกหนักต่อเนื่อง
        forecasts = [
          {
            date: "พรุ่งนี้",
            condition: "ฝนตกหนักมาก",
            rain_24h: selected.rainAmount + 50,
            temp_max: 30,
            humidity: 95,
          },
          {
            date: "มะรืนนี้",
            condition: "ฝนฟ้าคะนอง",
            rain_24h: selected.rainAmount + 20,
            temp_max: 31,
            humidity: 90,
          },
          {
            date: "3 วันข้างหน้า",
            condition: "มีเมฆมาก",
            rain_24h: 30,
            temp_max: 33,
            humidity: 75,
          },
        ];
      } else {
        // ✅ Real Forecast
        const { data: f } = await supabase
          .from("rain_forecasts")
          .select("*")
          .eq("dcode", dcode)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(3);
        forecasts = f || [];
      }

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
        rainSeries: rainSeries,
        forecast: forecasts,
        radarData: [
          {
            feature: "จุดเสี่ยง",
            value: selected.flood_point_count || 0,
            average: getAvg("flood_point_count"),
          },
          {
            feature: "คลอง",
            value: selected.canal_count || 0,
            average: getAvg("canal_count"),
          },
          {
            feature: "ปั๊ม",
            value: selected.pump_number || 0,
            average: getAvg("pump_number"),
          },
          {
            feature: "Rain Load",
            value: Math.min(Math.round(selected.rainLoad), 100),
            average: Math.min(Math.round(getAvg("rainLoad")), 100),
          },
        ],
      });
    } else {
      // --- OVERVIEW MODE ---

      // ✅ 1. Top Risky: กรองและเรียงลำดับให้ถูกต้องจาก mergedData ที่คำนวณมาแล้ว
      const topRisky = mergedData
        .filter((d) => d.riskLevel === "High Risk" || d.riskLevel === "Medium")
        .sort((a, b) => b.riskScore - a.riskScore) // เรียงจาก Score มาก -> น้อย
        .slice(0, 5);

      // 2. Flood Graph (Top 10 Flood Points)
      const floodGraphData = [...mergedData]
        .sort((a, b) => b.flood_point_count - a.flood_point_count)
        .slice(0, 10)
        .map((d) => ({ dname: d.dname, floods: d.flood_point_count }))
        .reverse(); // Nivo Bar แนวนอนต้อง reverse เพื่อให้ตัวมากสุดอยู่บน

      const maxRainDistrict = mergedData.reduce(
        (prev, curr) => (prev.rainAmount > curr.rainAmount ? prev : curr),
        {}
      );
      const totalPumps = mergedData.reduce((s, d) => s + d.pump_number, 0);
      const readyPumps = mergedData.reduce((s, d) => s + d.pump_ready, 0);

      const riskStats = mergedData.reduce(
        (acc, d) => {
          if (d.riskLevel === "High Risk") acc.high++;
          else if (d.riskLevel === "Medium") acc.med++;
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
          lastHighRiskDate: lastHighRiskDate,
          isHistoricalView: !!forceDate,
          activePumps:
            totalPumps > 0 ? Math.round((readyPumps / totalPumps) * 100) : 0,
          totalRiskCount: riskStats.high + riskStats.med,
          isSimulation: isMock,
        },
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
