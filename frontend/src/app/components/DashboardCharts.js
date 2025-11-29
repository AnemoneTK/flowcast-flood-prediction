"use client";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

// --- 1. Rainfall Comparison (Line) ---
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
        colors={{ datum: "color" }}
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
        sliceTooltip={({ slice }) => (
          <div className="bg-white p-3 border rounded shadow-lg text-sm w-40">
            <strong className="block mb-2 text-slate-700">
              เดือน {slice.points[0].data.x}
            </strong>
            {slice.points.map((point) => (
              <div key={point.id} className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: point.serieColor }}
                ></div>
                <span className="font-bold" style={{ color: point.serieColor }}>
                  {point.serieId}:
                </span>
                <span>{point.data.yFormatted} mm</span>
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
        }}
      />
    </div>
  );
}

// --- 2. Risk Ranking Chart (Bar) ---
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
      const rainLoadVal = d.rain_load || 0;
      // ใช้ structural vulnerability ถ้ามี หรือใช้ rain load ถ้าไม่มี
      const riskVal = d.vulnerability_score || rainLoadVal;

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

// --- 3. District Radar Chart (L2 Analysis) ---
export function DistrictRadarChart({ data, avgData }) {
  if (!data || !avgData) return null;

  // ป้องกันค่าเป็น 0 หรือ undefined
  const safeData = {
    pump_number: data.pump_number || 0,
    flood_point_count: data.flood_point_count || data.flood_points || 0,
    rain_load: data.rain_load || 0,
    recommended_pumps: data.recommended_pumps || 0,
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
      Val: Math.min(((safeData.vulnerability_score || 0) / 100) * 100, 100),
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

// --- 4. Cluster Distribution (Pie Chart) --- ✅ ตัวที่ขาดไป
export function ClusterDistributionChart({ data }) {
  if (!data) return null;

  // คำนวณจำนวนเขตในแต่ละระดับความเสี่ยง
  const stats = data.reduce(
    (acc, curr) => {
      if (curr.riskLevel === "High") acc.high++;
      else if (curr.riskLevel === "Medium") acc.med++;
      else acc.low++;
      return acc;
    },
    { high: 0, med: 0, low: 0 }
  );

  const chartData = [
    {
      id: "High Risk",
      label: "เสี่ยงสูง (High)",
      value: stats.high,
      color: "#ef4444",
    },
    {
      id: "Medium",
      label: "เฝ้าระวัง (Med)",
      value: stats.med,
      color: "#eab308",
    },
    {
      id: "Low Risk",
      label: "เสี่ยงต่ำ (Low)",
      value: stats.low,
      color: "#22c55e",
    },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ height: 350 }}>
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
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
          },
        ]}
      />
    </div>
  );
}

// --- 5. Pump Status Chart (ปรับปรุง Logic: เรียงตามอัตราส่วนเสีย) ---
export function PumpStatusChart({ data }) {
  if (!data || data.length === 0) return null;

  // 1. คำนวณ Ratio และ Sort
  const processedData = data
    .map((d) => {
      const total = d.pump_number || 0;
      const ready = d.pump_ready || 0;
      const broken = total - ready;
      // กันหารด้วย 0
      const brokenRatio = total > 0 ? broken / total : 0;
      return { ...d, broken, brokenRatio };
    })
    .sort((a, b) => b.brokenRatio - a.brokenRatio) // เรียงจากเสียเยอะ -> น้อย
    .slice(0, 10); // เอาแค่ 10 อันดับแรก

  // 2. แปลงเป็น format ของ Nivo
  const chartData = processedData.map((d) => ({
    district: d.dname,
    พร้อมใช้: d.pump_ready,
    "ชำรุด/ซ่อม": d.broken,
  }));

  return (
    <div style={{ height: 350 }}>
      <ResponsiveBar
        data={chartData}
        keys={["ชำรุด/ซ่อม", "พร้อมใช้"]} // เอาตัวที่เสียขึ้นก่อนให้น่าสนใจ
        indexBy="district"
        margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={({ id }) => (id === "พร้อมใช้" ? "#22c55e" : "#ef4444")}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "จำนวนเครื่องสูบ",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
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

export function RiskScatterPlot({ data }) {
  if (!data) return null;

  // จัดกลุ่มข้อมูลตาม Cluster เพื่อใส่สี
  const scatterData = [
    {
      id: "High Risk",
      data: data
        .filter((d) => d.cluster === 1)
        .map((d) => ({
          x: d.pump_number,
          y: d.flood_point_count,
          name: d.dname,
        })),
    },
    {
      id: "Well Managed",
      data: data
        .filter((d) => d.cluster === 2)
        .map((d) => ({
          x: d.pump_number,
          y: d.flood_point_count,
          name: d.dname,
        })),
    },
    {
      id: "Low Risk",
      data: data
        .filter((d) => d.cluster === 0)
        .map((d) => ({
          x: d.pump_number,
          y: d.flood_point_count,
          name: d.dname,
        })),
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <ResponsiveScatterPlot
        data={scatterData}
        margin={{ top: 20, right: 90, bottom: 70, left: 90 }}
        xScale={{ type: "linear", min: 0, max: "auto" }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        blendMode="multiply"
        colors={["#ef4444", "#eab308", "#10b981"]} // แดง เหลือง เขียว
        axisBottom={{
          legend: "จำนวนปั๊มน้ำ (Infrastructure)",
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisLeft={{
          legend: "จุดเสี่ยงน้ำท่วม (Risk)",
          legendPosition: "middle",
          legendOffset: -60,
        }}
        tooltip={({ node }) => (
          <div className="bg-white p-2 border shadow-sm text-xs">
            <strong>{node.data.name}</strong>
            <br />
            ปั๊ม: {node.data.x} | จุดเสี่ยง: {node.data.y}
          </div>
        )}
      />
    </div>
  );
}
