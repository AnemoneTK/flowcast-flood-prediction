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
  const isMock = searchParams.get("mock") === "true";

  try {
    if (mode === "list") {
      const { data: districts } = await supabase
        .from("districts")
        .select("dcode, dname")
        .order("dname");
      return NextResponse.json(districts || []);
    }

    const { data: districts } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, canal_count, pump_number, pump_ready, flood_point_count"
      );

    let mergedData = [];
    let targetDate = queryDate || new Date().toISOString().split("T")[0];
    let lastHighRiskDate = null;

    if (isMock) {
      targetDate = "SIMULATION-NOW";

      mergedData = districts.map((d, index) => {
        // บังคับให้ 10 เขตแรกเป็นเขตเสี่ยง (5 High, 5 Medium)
        let isCritical = false;
        let isWatch = false;

        if (index < 5) {
          isCritical = true;
        } else if (index < 10) {
          isWatch = true;
        }

        let mockRain = 0;
        let mockRiskLevel = "Low Risk";
        let mockCluster = 0;

        if (isCritical) {
          mockRiskLevel = "High Risk"; // ต้องตรงกับที่ Frontend เช็ค (หรือมีคำว่า High)
          mockCluster = 1;
          mockRain = 200 + Math.floor(Math.random() * 250);
        } else if (isWatch) {
          mockRiskLevel = "Medium";
          mockCluster = 2;
          mockRain = 80 + Math.floor(Math.random() * 120);
        } else {
          mockRain = Math.floor(Math.random() * 50);
        }

        return {
          ...d,
          riskLevel: mockRiskLevel, // ส่งค่านี้ไป
          cluster: mockCluster,
          riskScore: isCritical ? 90 : isWatch ? 60 : 10,
          rainAmount: mockRain,
          rainLoad: mockRain / (d.pump_number || 1),
          pump_ready: Math.floor(d.pump_number * (isCritical ? 0.5 : 0.9)),
          isMock: true,
        };
      });
    } else {
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
        };
      });
    }

    // Response
    if (dcode && dcode !== "null") {
      const selected = mergedData.find(
        (d) => String(d.dcode) === String(dcode)
      );
      if (!selected)
        return NextResponse.json(
          { error: "District not found" },
          { status: 404 }
        );

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
        [2023, 2024, 2025].forEach((year) => {
          rainSeries.push({
            id: String(year),
            data: months.map((m) => ({
              x: m,
              y: Math.floor(Math.random() * 300),
            })),
          });
        });
      } else {
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

      let forecasts = [];
      if (isMock) {
        forecasts = [
          {
            date: "พรุ่งนี้",
            condition: "10",
            rain_24h: selected.rainAmount + 50,
            temp_max: 30,
            humidity: 95,
          },
          {
            date: "มะรืนนี้",
            condition: "8",
            rain_24h: selected.rainAmount + 20,
            temp_max: 31,
            humidity: 90,
          },
          {
            date: "3 วันข้างหน้า",
            condition: "4",
            rain_24h: 30,
            temp_max: 33,
            humidity: 75,
          },
        ];
      } else {
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
      // Overview Mode
      const topRisky = mergedData
        .filter(
          (d) => d.riskLevel.includes("High") || d.riskLevel.includes("Medium")
        )
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);
      const floodGraphData = mergedData
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
          if (d.riskLevel.includes("High")) acc.high++;
          else if (d.riskLevel.includes("Medium")) acc.med++;
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
          isHistoricalView: !!forceDate,
          activePumps:
            totalPumps > 0 ? Math.round((readyPumps / totalPumps) * 100) : 0,
          totalRiskCount: riskStats.high + riskStats.med,
          isSimulation: isMock,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
