"use client";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsivePie } from "@nivo/pie";

// --- 1. Rainfall Comparison (Fixed Colors & Text Tooltip) ---
export function RainfallComparisonChart({ data }) {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div style={{ height: 300 }}>
      <ResponsiveLine
        data={data}
        // ✅ ใช้สีแบบ Array ธรรมดา (เทา, ฟ้า, ส้ม) ไม่ต้องพึ่ง logic ซับซ้อน
        colors={["#cbd5e1", "#3b82f6", "#f59e0b"]}
        margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: 0,
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.2f"
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Month",
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
        enableSlices="x"
        // ✅ Tooltip แบบข้อความ (Text-based) ตามที่ขอ
        sliceTooltip={({ slice }) => (
          <div className="bg-white p-4 border rounded-lg shadow-xl text-sm min-w-[160px]">
            <div className="font-bold text-slate-800 border-b pb-2 mb-2">
              เดือน {slice.points[0].data.x}
            </div>
            {slice.points.map((point) => (
              <div
                key={point.id}
                className="flex justify-between items-center py-1"
              >
                {/* ใช้ข้อความบอกปีตรงๆ ไม่ต้องเดาสี */}
                <span className="font-semibold text-slate-600">
                  {point.serieId === "2023" && "ปี 2023 (อดีต):"}
                  {point.serieId === "2024" && "ปี 2024 (ล่าสุด):"}
                  {point.serieId === "2025" && "ปี 2025 (ปัจจุบัน):"}
                </span>
                <span className="font-bold" style={{ color: point.serieColor }}>
                  {point.data.yFormatted} mm
                </span>
              </div>
            ))}
          </div>
        )}
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
          },
        ]}
        theme={{
          text: { fontSize: 12, fill: "#64748b" },
          tooltip: { container: { background: "#ffffff", color: "#333333" } },
          grid: { line: { stroke: "#f1f5f9", strokeWidth: 1 } },
        }}
      />
    </div>
  );
}

// --- 2. Risk Ranking Chart ---
export function RiskRankingChart({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  const chartData = data
    .slice(0, 10)
    .map((d) => {
      const name =
        d.district ||
        d.dname ||
        (d.districts && d.districts.dname) ||
        "Unknown";
      const pumpVal =
        d.pumps ||
        d.pump_number ||
        (d.districts && d.districts.pump_number) ||
        0;
      const riskVal = d.vulnerability_score || d.rain_load || 0;

      return {
        district: name,
        "Risk Score": parseFloat(riskVal.toFixed(1)),
        Pumps: parseFloat(pumpVal),
      };
    })
    .reverse();

  return (
    <div style={{ height: 350 }}>
      <ResponsiveBar
        data={chartData}
        keys={["Risk Score", "Pumps"]}
        indexBy="district"
        layout="horizontal"
        margin={{ top: 10, right: 130, bottom: 50, left: 120 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={["#ef4444", "#3b82f6"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Value",
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff"
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
        theme={{
          text: { fontSize: 12, fill: "#64748b" },
          tooltip: { container: { background: "#ffffff", color: "#333333" } },
        }}
      />
    </div>
  );
}

// --- 3. District Radar Chart ---
export function DistrictRadarChart({ data, avgData }) {
  if (!data || !avgData) return null;

  const safeData = {
    pump_number: data.pump_number || 0,
    flood_point_count: data.flood_point_count || data.flood_points || 0,
    rain_load: data.rain_load || 0,
    recommended_pumps: data.recommended_pumps || 0,
    vulnerability_score: data.vulnerability_score || 0,
    ...data,
  };

  const chartData = [
    {
      metric: "จุดเสี่ยงน้ำท่วม",
      Val: Math.min((safeData.flood_point_count / 15) * 100, 100),
    },
    {
      metric: "ปริมาณปั๊มน้ำ",
      Val: Math.min((safeData.pump_number / 20) * 100, 100),
    },
    {
      metric: "ความเสี่ยงโครงสร้าง",
      Val: Math.min((safeData.vulnerability_score / 100) * 100, 100),
    },
    {
      metric: "ภาระน้ำฝน (L3)",
      Val: Math.min((safeData.rain_load / 150) * 100, 100),
    },
    {
      metric: "คำแนะนำเพิ่มปั๊ม",
      Val: Math.min((safeData.recommended_pumps / 10) * 100, 100),
    },
  ];

  return (
    <div style={{ height: 300 }}>
      <ResponsiveRadar
        data={chartData}
        keys={["Val"]}
        indexBy="metric"
        maxValue={100}
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor={{ from: "color" }}
        gridLevels={5}
        gridShape="circular"
        enableDots={true}
        colors={["#6366f1"]}
        fillOpacity={0.25}
        blendMode="multiply"
        theme={{
          text: { fontSize: 12, fill: "#334155" },
        }}
      />
    </div>
  );
}

// --- 4. Cluster Distribution (Pie Chart) ---
export function ClusterDistributionChart({ stats }) {
  if (!stats) return null;

  const data = [
    {
      id: "High Risk",
      label: "เสี่ยงสูง",
      value: stats.high || 0,
      color: "#ef4444",
    },
    {
      id: "Well Managed",
      label: "เฝ้าระวัง",
      value: stats.med || 0,
      color: "#eab308",
    },
    {
      id: "Low Risk",
      label: "ปลอดภัย",
      value: stats.low || 0,
      color: "#10b981",
    },
  ].filter((d) => d.value > 0);

  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
        No Data
      </div>
    );

  return (
    <div style={{ height: 150 }}>
      <ResponsivePie
        data={data}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        innerRadius={0.6}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: "data.color" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLinkLabels={false}
        enableArcLabels={false}
        tooltip={({ datum: { id, value, color } }) => (
          <div className="p-2 bg-white border rounded shadow-sm text-xs flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span>
              {id}: <strong>{value}</strong>
            </span>
          </div>
        )}
      />
    </div>
  );
}
