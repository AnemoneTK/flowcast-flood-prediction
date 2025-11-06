// frontend/src/components/EdaCharts.js
"use client";

import { ResponsiveHeatMap } from "@nivo/heatmap";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

export const heatmapData = [
  {
    id: "คะแนนเสี่ยง",
    data: [
      { x: "จุดเสี่ยง", y: 0.85 },
      { x: "จุดเฝ้าระวัง", y: 0.6 },
      { x: "ความหนาแน่น ปชก.", y: 0.45 },
      { x: "จำนวนคลอง", y: -0.1 },
      { x: "อัตราปั๊มพร้อม", y: -0.3 },
      { x: "คะแนนเสี่ยง", y: 1.0 },
    ],
  },
  {
    id: "จุดเสี่ยง",
    data: [
      { x: "จุดเสี่ยง", y: 1.0 },
      { x: "จุดเฝ้าระวัง", y: 0.7 },
      { x: "ความหนาแน่น ปชก.", y: 0.5 },
      { x: "จำนวนคลอง", y: -0.2 },
      { x: "อัตราปั๊มพร้อม", y: -0.4 },
      { x: "คะแนนเสี่ยง", y: 0.85 },
    ],
  },
  {
    id: "จุดเฝ้าระวัง",
    data: [
      { x: "จุดเสี่ยง", y: 0.7 },
      { x: "จุดเฝ้าระวัง", y: 1.0 },
      { x: "ความหนาแน่น ปชก.", y: 0.4 },
      { x: "จำนวนคลอง", y: 0.0 },
      { x: "อัตราปั๊มพร้อม", y: -0.2 },
      { x: "คะแนนเสี่ยง", y: 0.6 },
    ],
  },
  {
    id: "ความหนาแน่น ปชก.",
    data: [
      { x: "จุดเสี่ยง", y: 0.5 },
      { x: "จุดเฝ้าระวัง", y: 0.4 },
      { x: "ความหนาแน่น ปชก.", y: 1.0 },
      { x: "จำนวนคลอง", y: 0.1 },
      { x: "อัตราปั๊มพร้อม", y: 0.0 },
      { x: "คะแนนเสี่ยง", y: 0.45 },
    ],
  },
  {
    id: "จำนวนคลอง",
    data: [
      { x: "จุดเสี่ยง", y: -0.2 },
      { x: "จุดเฝ้าระวัง", y: 0.0 },
      { x: "ความหนาแน่น ปชก.", y: 0.1 },
      { x: "จำนวนคลอง", y: 1.0 },
      { x: "อัตราปั๊มพร้อม", y: 0.5 },
      { x: "คะแนนเสี่ยง", y: -0.1 },
    ],
  },
  {
    id: "อัตราปั๊มพร้อม",
    data: [
      { x: "จุดเสี่ยง", y: -0.4 },
      { x: "จุดเฝ้าระวัง", y: -0.2 },
      { x: "ความหนาแน่น ปชก.", y: 0.0 },
      { x: "จำนวนคลอง", y: 0.5 },
      { x: "อัตราปั๊มพร้อม", y: 1.0 },
      { x: "คะแนนเสี่ยง", y: -0.3 },
    ],
  },
];

// --- (สำคัญ!) เรา export component กราฟแต่ละตัว ---

export const CorrelationHeatmap = ({ data }) => (
  <div style={{ height: "450px", width: "100%" }}>
    <ResponsiveHeatMap
      data={data}
      keys={[
        "คะแนนเสี่ยง",
        "จุดเสี่ยง",
        "จุดเฝ้าระวัง",
        "ความหนาแน่น ปชก.",
        "จำนวนคลอง",
        "อัตราปั๊มพร้อม",
      ]}
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

export const FloodPointsBarChart = ({ data }) => (
  <div style={{ height: "450px", width: "100%" }}>
    <ResponsiveBar
      data={data}
      keys={["จำนวนจุดอ่อนน้ำท่วม"]}
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
        legend: "จำนวนจุดอ่อนน้ำท่วม (จุด)",
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

export const PopulationVsFloodScatterPlot = ({ data }) => (
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
        legend: "ความหนาแน่นประชากร (คน / ตร.กม.)",
        legendPosition: "middle",
        legendOffset: 46,
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "จำนวนจุดอ่อนน้ำท่วม (จุด)",
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
          <span className="text-gray-700">ความหนาแน่น: </span>
          <strong className="text-blue-600">
            {node.data.x.toLocaleString()}
          </strong>
          <br />
          <span className="text-gray-700">จุดอ่อนน้ำท่วม: </span>
          <strong className="text-blue-600">{node.data.y} จุด</strong>
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

export const RainfallVsFloodPointScatterPlot = ({ data }) => (
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
        legend: "ปริมาณฝนสูงสุด 24 ชม. (มม.)",
        legendPosition: "middle",
        legendOffset: 46,
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "จำนวนจุดอ่อนน้ำท่วม (จุด)",
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
          <span className="text-gray-700">ฝนสูงสุด: </span>
          <strong className="text-blue-600">
            {node.data.x.toFixed(1)} มม.
          </strong>
          <br />
          <span className="text-gray-700">จุดอ่อนน้ำท่วม: </span>
          <strong className="text-blue-600">{node.data.y} จุด</strong>
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
