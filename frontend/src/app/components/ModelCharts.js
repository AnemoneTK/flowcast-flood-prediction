"use client";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { useState } from "react";

// --- 1. K-Selection Chart (กราฟเส้น) ---
export function KSelectionChart() {
  const data = [
    {
      id: "Silhouette Score",
      color: "#f97316",
      data: [
        { x: 2, y: 0.65 },
        { x: 3, y: 0.58 },
        { x: 4, y: 0.42 },
        { x: 5, y: 0.38 },
        { x: 6, y: 0.35 },
        { x: 7, y: 0.33 },
        { x: 8, y: 0.3 },
      ],
    },
    {
      id: "Inertia (Elbow)",
      color: "#3b82f6",
      data: [
        { x: 2, y: 0.9 },
        { x: 3, y: 0.35 },
        { x: 4, y: 0.25 },
        { x: 5, y: 0.18 },
        { x: 6, y: 0.12 },
        { x: 7, y: 0.1 },
        { x: 8, y: 0.08 },
      ],
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={data}
        colors={{ datum: "color" }}
        margin={{ top: 50, right: 120, bottom: 60, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: 1.0 }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Number of Clusters (k)",
          legendOffset: 40,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Score",
          legendOffset: -45,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableSlices="x"
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
        markers={[
          {
            axis: "x",
            value: 3,
            lineStyle: {
              stroke: "#b0413e",
              strokeWidth: 2,
              strokeDasharray: "5, 5",
            },
            legend: "Selected (k=3)",
            legendOrientation: "vertical",
          },
        ]}
      />
    </div>
  );
}
const getCustomColor = (serie) => {
  console.log(serie);
  const id = serie.serieId; // ชื่อกลุ่ม เช่น "Group 0", "High Risk"

  // ✅ กำหนดสีตามใจชอบตรงนี้ (Hex Code)
  if (id?.includes("1") || id?.includes("High")) return "#ef4444"; // 🔴 สีแดง (Cluster 1 / High Risk)
  if (id?.includes("2") || id?.includes("Well")) return "#eab308"; // 🟡 สีเหลือง (Cluster 2 / Well Managed)
  if (id?.includes("0") || id?.includes("Low")) return "#10b981"; // 🟢 สีเขียว (Cluster 0 / Low Risk)

  // สีสำรองสำหรับกลุ่มอื่นๆ (กรณี K=4, 6)
  // ให้วนสีจากชุดนี้
  const fallbackColors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#14b8a6",
    "#6366f1",
  ];
  const num = parseInt(id?.replace(/\D/g, "")) || 0; // ดึงตัวเลขจากชื่อกลุ่มมาเลือกสี
  return fallbackColors[num % fallbackColors.length];
};

// --- 2. Cluster Comparison (กราฟจุด Scatter) ---
export function ClusterComparison({ dataK3, dataK4, dataK6 }) {
  const [currentK, setCurrentK] = useState(3);

  const getData = () => {
    if (currentK === 4) return dataK4;
    if (currentK === 6) return dataK6;
    return dataK3;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {[3, 4, 6].map((k) => (
          <button
            key={k}
            onClick={() => setCurrentK(k)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                currentK === k
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            K = {k} {k === 3 ? "(Selected)" : ""}
          </button>
        ))}
      </div>

      <div style={{ height: 450 }}>
        <ResponsiveScatterPlot
          data={getData()}
          margin={{ top: 40, right: 140, bottom: 70, left: 90 }}
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          yScale={{ type: "linear", min: "auto", max: "auto" }}
          blendMode="multiply"
          colors={getCustomColor}
          nodeSize={12}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "PC1 (Main Variance)",
            legendPosition: "middle",
            legendOffset: 46,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "PC2 (Secondary Variance)",
            legendPosition: "middle",
            legendOffset: -60,
          }}
          tooltip={({ node }) => (
            <div className="bg-white p-3 border rounded shadow-lg text-sm z-50 text-slate-800 w-40">
              <strong className="text-blue-800">{node.data.district}</strong>
              <div className="text-gray-600 mt-1">
                Group: {node.serieId}
                <br />
                Rain Load: {node.data.load?.toFixed(1)}
              </div>
            </div>
          )}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              translateX: 130,
              itemWidth: 100,
              itemHeight: 12,
              itemsSpacing: 5,
              symbolSize: 12,
              symbolShape: "circle",
            },
          ]}
        />
      </div>
    </div>
  );
}

// --- 3. Model Comparison (NEW & FIXED LAYOUT) ---
export function ModelComparisonChart({ data }) {
  return (
    <div style={{ height: 550, width: "100%" }}>
      {" "}
      {/* 1. เพิ่มความสูงเป็น 550px เพื่อให้มีที่เหลือเฟือ */}
      <ResponsiveBar
        data={data}
        keys={["Accuracy", "F1"]}
        indexBy="model"
        groupMode="grouped"
        // 2. จัด Margin ใหม่: Bottom 140px เพื่อให้ Legend อยู่ได้สบายๆ ไม่ตกขอบ
        margin={{ top: 50, right: 30, bottom: 140, left: 70 }}
        padding={0.3}
        innerPadding={4}
        // 3. Scale: เริ่มที่ 0.85 - 1.05 (มีที่ว่างด้านบน)
        valueScale={{ type: "linear", min: 0, max: 1 }}
        indexScale={{ type: "band", round: true }}
        colors={["#4f46e5", "#10b981"]}
        borderRadius={4}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        // 4. Theme: สีเทาเข้ม (Slate-600) บนพื้นขาว
        theme={{
          text: {
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            fill: "#475569",
          },
          axis: {
            domain: { line: { stroke: "#cbd5e1", strokeWidth: 1 } },
            ticks: {
              line: { stroke: "#cbd5e1", strokeWidth: 1 },
              text: { fill: "#64748b" },
            },
            legend: {
              text: { fontSize: 14, fontWeight: "bold", fill: "#334155" },
            },
          },
          grid: {
            line: { stroke: "#e2e8f0", strokeWidth: 1, strokeDasharray: "4 4" },
          },
          tooltip: {
            container: {
              background: "#ffffff",
              color: "#333333",
              fontSize: 13,
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              border: "1px solid #f1f5f9",
            },
          },
        }}
        axisTop={null}
        axisRight={null}
        // แกน X: ชื่อโมเดล
        axisBottom={{
          tickSize: 0,
          tickPadding: 15,
          tickRotation: 0,
          legend: "",
        }}
        // แกน Y: คะแนน
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          tickRotation: 0,
          legend: "Performance Score",
          legendPosition: "middle",
          legendOffset: -55,
          format: (value) => `${value.toFixed(2)}`,
        }}
        enableGridY={true}
        // Label สีขาวบนแท่งกราฟ
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#ffffff"
        label={(d) => d.value.toFixed(4)}
        tooltip={({ id, value, indexValue, color }) => (
          <div className="p-3 bg-white rounded-lg border border-slate-100 min-w-[160px] shadow-lg">
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-wider">
              {indexValue}
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="font-semibold text-slate-600">{id}</span>
              </div>
              <span className="font-bold text-slate-800 text-lg">
                {value.toFixed(4)}
              </span>
            </div>
          </div>
        )}
        // 5. Legend: ย้ายมาอยู่ "ใต้กราฟ" (Bottom Center) และดันลงมา (translateY 80)
        // Margin Bottom 140px ที่เผื่อไว้จะรองรับตรงนี้พอดี
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 90,
            itemsSpacing: 40,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 15,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 0.8,
                },
              },
            ],
          },
        ]}
        animate={true}
        motionConfig="gentle"
      />
    </div>
  );
}

export function ClusterProfileTable({ data }) {
  if (!data || data.length === 0) return <div>No Profile Data</div>;

  // กำหนดคอลัมน์ให้ครบ 6 ตัวตามรูป
  const columns = [
    { key: "total_rain", label: "Total Rain" },
    { key: "rain_load_per_pump", label: "Rain Load" },
    { key: "pump_density", label: "Pump Den." },
    { key: "canal_density", label: "Canal Den." },
    { key: "pop_density", label: "Pop. Den." },
    { key: "flood_point_count", label: "Flood Pts" },
  ];

  const getBgColor = (value) => {
    // สีส้มแดงตามความเข้ม (ค่า 0 สีจาง -> ค่า 1 สีเข้ม)
    return `rgba(249, 115, 22, ${0.05 + value * 0.95})`;
  };

  const getGroupName = (clusterId) => {
    // ปรับ Logic ตามผลลัพธ์จริงของคุณ (สมมติ Cluster 1 คือ High Risk)
    if (clusterId === "Cluster 1")
      return <span className="text-red-600 font-bold">High Risk</span>;
    if (clusterId === "Cluster 2")
      return <span className="text-yellow-600 font-bold">Well Managed</span>;
    return <span className="text-green-600 font-bold">Low Risk</span>;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 font-bold">Cluster</th>
            {columns.map((col) => (
              <th key={col.key} className="px-2 py-3 text-center">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                <div className="text-base">{getGroupName(row.id)}</div>
              </td>
              {columns.map((col) => {
                // ✅ ใช้ค่า normalized (0-1) มาแสดงผลแทนค่าจริง
                const norm = row.normalized[col.key];
                return (
                  <td key={col.key} className="p-1 text-center">
                    <div
                      className="h-10 flex items-center justify-center rounded-lg font-medium transition-all mx-auto w-16"
                      style={{
                        backgroundColor: getBgColor(norm),
                        // ถ้าสีเข้ม (ค่า > 0.6) ให้ตัวหนังสือสีขาว
                        color: norm > 0.6 ? "white" : "#334155",
                      }}
                    >
                      {/* แสดงทศนิยม 2 ตำแหน่ง */}
                      {norm?.toFixed(2)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 bg-slate-50 text-xs text-center text-slate-400 italic">
        * Values are normalized (0.00 - 1.00) relative to other clusters
      </div>
    </div>
  );
}
