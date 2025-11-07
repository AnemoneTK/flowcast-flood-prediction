// frontend/src/components/EdaCharts.js
"use client";

import { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { ResponsiveBoxPlot } from "@nivo/boxplot";

// --- 1. ข้อมูล Hard-code สำหรับ Correlation Heatmap (ไม่เปลี่ยนแปลง) ---
export const heatmapData = [
  {
    id: "คะแนนเสี่ยง",
    data: [
      { x: "คะแนนรวม", y: 1.0 },
      { x: "avg_rain_rainy", y: -0.26 },
      { x: "avg_rain_summer", y: -0.09 },
      { x: "avg_rain_winter", y: -0.06 },
      { x: "pump_ready", y: -0.41 },
      { x: "population", y: -0.53 },
    ],
  },
  {
    id: "avg_rain_rainy",
    data: [
      { x: "คะแนนรวม", y: -0.26 },
      { x: "avg_rain_rainy", y: 1.0 },
      { x: "avg_rain_summer", y: 0.54 },
      { x: "avg_rain_winter", y: 0.38 },
      { x: "pump_ready", y: 0.22 },
      { x: "population", y: 0.07 },
    ],
  },
  {
    id: "avg_rain_summer",
    data: [
      { x: "คะแนนรวม", y: -0.09 },
      { x: "avg_rain_rainy", y: 0.54 },
      { x: "avg_rain_summer", y: 1.0 },
      { x: "avg_rain_winter", y: 0.32 },
      { x: "pump_ready", y: 0.17 },
      { x: "population", y: -0.05 },
    ],
  },
  {
    id: "avg_rain_winter",
    data: [
      { x: "คะแนนรวม", y: -0.06 },
      { x: "avg_rain_rainy", y: 0.38 },
      { x: "avg_rain_summer", y: 0.32 },
      { x: "avg_rain_winter", y: 1.0 },
      { x: "pump_ready", y: 0.23 },
      { x: "population", y: 0.22 },
    ],
  },
  {
    id: "pump_ready",
    data: [
      { x: "คะแนนรวม", y: -0.41 },
      { x: "avg_rain_rainy", y: 0.22 },
      { x: "avg_rain_summer", y: 0.17 },
      { x: "avg_rain_winter", y: 0.23 },
      { x: "pump_ready", y: 1.0 },
      { x: "population", y: 0.53 },
    ],
  },
  {
    id: "population",
    data: [
      { x: "คะแนนรวม", y: -0.53 },
      { x: "avg_rain_rainy", y: 0.07 },
      { x: "avg_rain_summer", y: -0.05 },
      { x: "avg_rain_winter", y: 0.22 },
      { x: "pump_ready", y: 0.53 },
      { x: "population", y: 1.0 },
    ],
  },
];
export const heatmapKeys = [
  "คะแนนรวม",
  "avg_rain_rainy",
  "avg_rain_summer",
  "avg_rain_winter",
  "pump_ready",
  "population",
];

// --- Component กราฟ Heatmap (ไม่เปลี่ยนแปลง) ---
export const CorrelationHeatmap = ({ data, keys }) => (
  <div style={{ height: "500px", width: "100%" }}>
    <ResponsiveHeatMap
      data={data}
      keys={keys}
      indexBy="id"
      margin={{ top: 110, right: 0, bottom: 100, left: 130 }}
      colors={{
        type: "diverging",
        scheme: "red_blue",
        divergeAt: 0.5,
        minValue: -1.0,
        maxValue: 1.0,
      }}
      cellComponent="circle"
      cellBorderWidth={1}
      cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
      labelTextColor="#ffffff"
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: "ตัวแปร (Y)",
        legendPosition: "middle",
        legendOffset: -95,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ตัวแปร (X)",
        legendPosition: "middle",
        legendOffset: -125,
      }}
      tooltip={({ cell }) => (
        <div className="bg-white p-2 rounded shadow border w-56">
          <strong className="text-gray-900">{cell.serieId}</strong>
          <span className="text-gray-700"> vs </span>
          <strong className="text-gray-900">{cell.data.x}</strong>
          <br />
          <span className="text-gray-700">Correlation: </span>
          <strong className="text-blue-600">{cell.data.y.toFixed(2)}</strong>
        </div>
      )}
      legends={[
        {
          anchor: "bottom",
          translateX: 0,
          translateY: 80,
          length: 400,
          thickness: 8,
          direction: "row",
          title: "ค่า Correlation (-1.0 ถึง 1.0)",
          titleAlign: "middle",
          titleOffset: 10,
          tickSize: 3,
          tickValues: [-1, -0.5, 0, 0.5, 1],
        },
      ]}
    />
  </div>
);

// --- Component กราฟ Bar Chart (ไม่เปลี่ยนแปลง) ---
export const FloodPointsBarChart = ({ data }) => (
  <div style={{ height: "450px", width: "100%" }}>
    <ResponsiveBar
      data={data}
      keys={["จำนวนจุดเสี่ยง"]}
      indexBy="district"
      margin={{ top: 30, right: 60, bottom: 60, left: 100 }}
      padding={0.3}
      layout="horizontal"
      colors={{ scheme: "category10" }}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "จำนวนจุดเสี่ยง (จุด)",
        legendPosition: "middle",
        legendOffset: 45,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "เขต",
        legendPosition: "middle",
        legendOffset: -90,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
      tooltip={({ id, value, color, indexValue }) => (
        <div className="bg-white p-2 rounded shadow border w-56">
          <strong style={{ color }}>{indexValue}</strong>
          <br />
          <span className="text-gray-700">{id}: </span>
          <strong className="text-blue-600">{value} จุด</strong>
        </div>
      )}
    />
  </div>
);

// --- (แก้ไข) Component กราฟ Box Plot (Seasonal Rain) ---
export const SeasonalRainBoxPlot = ({ data }) => (
  <div style={{ height: "450px", width: "100%" }}>
    <ResponsiveBoxPlot
      data={data}
      groups={["Winter", "Summer", "Rainy"]} // กำหนดลำดับ
      margin={{ top: 60, right: 60, bottom: 70, left: 60 }}
      value="value"
      colors={{ scheme: "nivo" }}
      borderRadius={2}
      borderWidth={2}
      borderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
      medianWidth={2}
      medianColor={{ from: "color", modifiers: [["darker", 0.4]] }}
      whiskerColor={{ from: "color", modifiers: [["darker", 0.4]] }}
      motionStiffness={90}
      motionDamping={15}
      // --- *** 1. แก้ไข (ย้ายแกน X ลงล่าง) *** ---
      axisTop={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0, // 0 องศา (แนวนอน)
        legend: "ฤดูกาล",
        legendPosition: "middle",
        legendOffset: 46,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ค่าเฉลี่ยฝน 24 ชม. (มม.)",
        legendPosition: "middle",
        legendOffset: -50,
      }}
      // --- *** 2. แก้ไข (เพิ่ม theme แก้สีตัวอักษร) *** ---
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
              fill: "#333333", // เปลี่ยนสีตัวอักษรแกน X, Y เป็นสีเข้ม
            },
          },
          legend: {
            text: {
              fontSize: 14,
              fill: "#333333", // เปลี่ยนสี Legend (หัวข้อแกน) เป็นสีเข้ม
            },
          },
        },
        tooltip: {
          container: {
            background: "#ffffff",
          },
        },
      }}
      // --- *** 3. แก้ไข (Tooltip ให้อ่าน 'data' object) *** ---
      tooltip={(
        { group, value, data } // (แก้) เพิ่ม 'data'
      ) => (
        <div className="bg-white p-2 rounded shadow border w-48">
          <strong>{group}</strong>
          <br />
          {/* ตรวจสอบว่า 'data' (สำหรับกล่อง) หรือ 'value' (สำหรับ outlier) */}
          {data ? (
            <>
              <span className="text-gray-700">Median: </span>
              <strong className="text-blue-600">
                {data.median?.toFixed(2) ?? "N/A"} มม.
              </strong>
              <br />
              <span className="text-gray-700">Q1: </span>
              <strong className="text-blue-600">
                {data.q1?.toFixed(2) ?? "N/A"} มม.
              </strong>
              <br />
              <span className="text-gray-700">Q3: </span>
              <strong className="text-blue-600">
                {data.q3?.toFixed(2) ?? "N/A"} มม.
              </strong>
            </>
          ) : (
            <>
              <span className="text-gray-700">Outlier: </span>
              <strong className="text-blue-600">
                {value?.toFixed(2) ?? "N/A"} มม.
              </strong>
            </>
          )}
        </div>
      )}
    />
  </div>
);

// --- Component กราฟ Scatter Plot (Risk vs Rainy) (ไม่เปลี่ยนแปลง) ---
export const RiskVsRainyScatterPlot = ({ data }) => (
  <div style={{ height: "450px", width: "100%" }}>
    <ResponsiveScatterPlot
      data={data}
      margin={{ top: 60, right: 140, bottom: 70, left: 100 }}
      xScale={{ type: "linear", min: 0, max: "auto" }}
      yScale={{ type: "linear", min: 0, max: "auto" }}
      blendMode="multiply"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ค่าเฉลี่ยฝน 24 ชม. (ฤดูฝน)",
        legendPosition: "middle",
        legendOffset: 46,
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "คะแนนความเสี่ยง",
        legendPosition: "middle",
        legendOffset: -80,
      }}
      tooltip={({ node }) => (
        <div
          className="bg-white p-2 rounded shadow border w-56"
          style={{ color: node?.style?.color }}
        >
          <strong>{node.data.name}</strong>
          <br />
          <span className="text-gray-700">ฝนฤดูฝน (เฉลี่ย): </span>
          <strong className="text-blue-600">
            {node.data.x.toFixed(1)} มม.
          </strong>
          <br />
          <span className="text-gray-700">คะแนนเสี่ยง: </span>
          <strong className="text-blue-600">{node.data.y}</strong>
        </div>
      )}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 130,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 12,
          symbolShape: "circle",
        },
      ]}
    />
  </div>
);

// --- Component หลักที่รวมกราฟทั้งหมด (ไม่เปลี่ยนแปลง) ---
export default function EdaCharts() {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const dataUrl = "/data/master_district_features.csv";
        const featuresCsv = await csv(dataUrl);

        const processedFeatures = featuresCsv.map((d) => ({
          dname: d.dname,
          district_group: d.district_group,
          flood_point_count: +d.จำนวนจุดเสี่ยง || 0,
          risk_score: +d.คะแนนรวม || 0,
          avg_rain_rainy: +d.avg_rain_rainy || 0,
          avg_rain_summer: +d.avg_rain_summer || 0,
          avg_rain_winter: +d.avg_rain_winter || 0,
        }));

        const barChartData = [...processedFeatures]
          .sort((a, b) => b.flood_point_count - a.flood_point_count)
          .slice(0, 10)
          .map((d) => ({
            district: d.dname,
            จำนวนจุดเสี่ยง: d.flood_point_count,
          }))
          .sort((a, b) => a["จำนวนจุดเสี่ยง"] - b["จำนวนจุดเสี่ยง"]);

        const boxPlotData = [];
        processedFeatures.forEach((d) => {
          // (แก้) ตรวจสอบว่าเป็นตัวเลขก่อน push
          if (!isNaN(d.avg_rain_winter))
            boxPlotData.push({ group: "Winter", value: d.avg_rain_winter });
          if (!isNaN(d.avg_rain_summer))
            boxPlotData.push({ group: "Summer", value: d.avg_rain_summer });
          if (!isNaN(d.avg_rain_rainy))
            boxPlotData.push({ group: "Rainy", value: d.avg_rain_rainy });
        });

        const riskVsRainyData = Object.values(
          processedFeatures.reduce((acc, d) => {
            const group = d.district_group || "ไม่ระบุ";
            if (group && !acc[group]) acc[group] = { id: group, data: [] };
            if (group) {
              acc[group].data.push({
                x: d.avg_rain_rainy,
                y: d.risk_score,
                name: d.dname,
              });
            }
            return acc;
          }, {})
        );

        setChartData({
          barChartData,
          boxPlotData,
          riskVsRainyData,
        });
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      {/* --- กราฟที่ 1: Heatmap (ใช้ข้อมูล Hard-code) --- */}
      <div className="mb-12">
        <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          1. Correlation Heatmap (Seasonal)
        </h4>
        {/* --- (แก้ Linter) --- */}
        <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
          อัปเดตความสัมพันธ์โดยใช้ค่าเฉลี่ยฝนรายฤดู
        </p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
          <div className="min-w-[600px] lg:min-w-full">
            <CorrelationHeatmap data={heatmapData} keys={heatmapKeys} />
          </div>
        </div>
      </div>

      <hr className="my-12 border-gray-300" />

      {/* --- ส่วนนี้จะแสดงเมื่อข้อมูล CSV โหลดเสร็จ --- */}
      {isLoading && (
        <div className="text-center p-10 text-lg text-gray-600">
          กำลังโหลดข้อมูลกราฟจาก CSV...
        </div>
      )}

      {!isLoading && !chartData && (
        <div className="text-center p-10 text-lg text-red-600">
          ไม่สามารถโหลดข้อมูล <code>master_district_features.csv</code> ได้
          <br />
          โปรดตรวจสอบว่าไฟล์อยู่ที่ <code>/public/data/</code>
        </div>
      )}

      {!isLoading && chartData && (
        <div className="space-y-8">
          <div className="mb-12">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              2. Top 10 Districts by Flood Points
            </h4>
            {/* --- (แก้ Linter) --- */}
            <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
              10 อันดับเขตที่มีจุดเสี่ยง (จากรายงานปี 60) มากที่สุด
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
              <div className="min-w-[600px] lg:min-w-full">
                <FloodPointsBarChart data={chartData.barChartData} />
              </div>
            </div>
          </div>

          <hr className="my-12 border-gray-300" />

          {/* --- (ใหม่) กราฟที่ 3 --- */}
          <div className="mb-12">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              3. การกระจายตัวของฝนรายฤดู (Seasonal Rain Distribution)
            </h4>
            {/* --- (แก้ Linter) --- */}
            <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
              เปรียบเทียบการกระจายตัวของค่าเฉลี่ยฝนทั้ง 50 เขต ใน 3 ฤดูกาล
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
              <div className="min-w-[600px] lg:min-w-full">
                <SeasonalRainBoxPlot data={chartData.boxPlotData} />
              </div>
            </div>
          </div>

          <hr className="my-12 border-gray-300" />

          {/* --- (ใหม่) กราฟที่ 4 --- */}
          <div className="mb-8">
            <h4 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              4. Risk Score vs. Rainy Season (ความสัมพันธ์)
            </h4>
            {/* --- (แก้ Linter) --- */}
            <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
              เปรียบเทียบ &ldquo;คะแนนความเสี่ยง&rdquo; (แกน Y) กับ
              &ldquo;ค่าเฉลี่ยฝนในฤดูฝน&rdquo; (แกน X)
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
              <div className="min-w-[600px] lg:min-w-full">
                {/* (แก้) ตรวจสอบว่า key นี้ถูกต้อง (riskVsRainyData) */}
                <RiskVsRainyScatterPlot data={chartData.riskVsRainyData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
