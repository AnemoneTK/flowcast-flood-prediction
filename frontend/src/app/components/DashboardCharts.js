// src/app/components/DashboardCharts.js
"use client";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsivePie } from "@nivo/pie";

// --- 1. Yearly Rainfall Comparison (Line Chart 3 Years) ---
export function YearlyComparisonLineChart({ data }) {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 rounded-xl">
        ไม่มีข้อมูลปริมาณฝนย้อนหลัง
      </div>
    );

  return (
    <div style={{ height: 350 }}>
      <ResponsiveLine
        data={data} // format: [{id: "2023", data: [{x:"Jan", y:10},...]}, ...]
        margin={{ top: 30, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: 0,
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.0f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "เดือน (Month)",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "ปริมาณฝน (mm)",
          legendOffset: -45,
          legendPosition: "middle",
        }}
        pointSize={8}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableSlices="x" // มีเส้นลากลงมาเทียบกัน
        colors={({ id }) => {
          if (id === "2025") return "#2563eb"; // ปีปัจจุบันสีน้ำเงินเข้ม
          if (id === "2024") return "#f59e0b"; // ปีที่แล้วสีเหลือง
          return "#cbd5e1"; // 2 ปีก่อนสีเทาจางๆ
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
          },
        ]}
        theme={{
          axis: { ticks: { text: { fontSize: 12, fill: "#64748b" } } },
          grid: { line: { stroke: "#e2e8f0" } },
          crosshair: {
            line: { stroke: "#64748b", strokeWidth: 1, strokeDasharray: "6 6" },
          },
        }}
      />
    </div>
  );
}

// --- 2. Cluster Distribution (Pie Chart) ---
export function ClusterDistributionChart({ data }) {
  if (!data) return null;

  const stats = data.reduce(
    (acc, curr) => {
      if (curr.riskLevel === "High Risk") acc.high++;
      else if (curr.riskLevel === "Medium") acc.med++;
      else acc.low++;
      return acc;
    },
    { high: 0, med: 0, low: 0 }
  );

  const chartData = [
    {
      id: "เสี่ยงสูง",
      label: "เสี่ยงสูง",
      value: stats.high,
      color: "#ef4444",
    },
    { id: "เฝ้าระวัง", label: "เฝ้าระวัง", value: stats.med, color: "#eab308" },
    { id: "ปกติ", label: "ปกติ", value: stats.low, color: "#22c55e" },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0)
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        No Data
      </div>
    );

  return (
    <div style={{ height: 300 }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: "data.color" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            translateY: 56,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#999",
            symbolSize: 18,
            symbolShape: "circle",
          },
        ]}
      />
    </div>
  );
}

// --- 3. Pump Status Chart ---
export function PumpStatusChart({ data }) {
  if (!data || data.length === 0) return null;

  const processedData = data
    .map((d) => {
      const total = d.pump_number || 0;
      const ready = d.pump_ready || 0;
      const broken = total - ready;
      const brokenRatio = total > 0 ? broken / total : 0;
      return { ...d, broken, brokenRatio };
    })
    .sort((a, b) => b.brokenRatio - a.brokenRatio)
    .slice(0, 10);

  const chartData = processedData.map((d) => ({
    district: d.dname,
    พร้อมใช้: d.pump_ready,
    ชำรุด: d.broken,
  }));

  return (
    <div style={{ height: 350 }}>
      <ResponsiveBar
        data={chartData}
        keys={["ชำรุด", "พร้อมใช้"]}
        indexBy="district"
        margin={{ top: 20, right: 130, bottom: 70, left: 60 }}
        padding={0.3}
        colors={({ id }) => (id === "พร้อมใช้" ? "#22c55e" : "#ef4444")}
        axisBottom={{
          tickRotation: -45,
        }}
        axisLeft={{
          legend: "จำนวนเครื่องสูบ",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
          },
        ]}
      />
    </div>
  );
}

// --- 4. Responsive Bar (Flood History) ---
export function SimpleBarChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ height: 320 }}>
      <ResponsiveBar
        data={data}
        keys={["floods"]}
        indexBy="dname"
        margin={{ top: 10, right: 30, bottom: 50, left: 100 }}
        padding={0.3}
        layout="horizontal"
        colors={["#3B82F6"]}
        borderRadius={4}
        axisLeft={{ tickSize: 0, tickPadding: 10 }}
        axisBottom={{
          legend: "จำนวนครั้งที่ท่วม",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        enableGridX={true}
        enableLabel={false}
        theme={{ axis: { ticks: { text: { fontSize: 12, fill: "#64748b" } } } }}
      />
    </div>
  );
}
