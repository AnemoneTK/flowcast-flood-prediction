// frontend/src/app/components/EdaCharts.js
"use client";

import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { ResponsiveBoxPlot } from "@nivo/boxplot";

// --- (กราฟ 1) Component กราฟที่ 1: Grouped Bar Chart (Cluster Profile) ---
// (แก้) เพิ่ม default props data = [] และ keys = []
export const ClusterProfileBarChart = ({ data = [], keys = [] }) => (
  <div style={{ height: "450px", width: "100%" }}>
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy="cluster"
      margin={{ top: 50, right: 160, bottom: 50, left: 60 }}
      padding={0.3}
      groupMode="grouped"
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Cluster",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ค่าเฉลี่ย (ปรับสเกล 0-1)",
        legendPosition: "middle",
        legendOffset: -45,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
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
      animate={true}
      motionStiffness={90}
      motionDamping={15}
      tooltip={({ id, value, indexValue, color }) => (
        <div className="bg-white p-2 rounded shadow border w-64">
          <strong style={{ color }}>{indexValue}</strong>
          <br />
          <span className="text-gray-700">{id}: </span>
          <strong className="text-blue-600">{value.toFixed(4)}</strong>
        </div>
      )}
    />
  </div>
);

// --- (กราฟ 2) Component กราฟที่ 2: Scatter Plot (Risk vs Population Density) ---
// (แก้) เพิ่ม default prop data = []
export const RiskVsDensityScatterPlot = ({ data = [] }) => (
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
        legend: "Population Density",
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
          <span className="text-gray-700">Population Density: </span>
          <strong className="text-blue-600">{node.data.x.toFixed(2)}</strong>
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

// --- (กราฟ 3) Component กราฟที่ 3: Scatter Plot (Risk vs Pump Readiness) ---
// (แก้) เพิ่ม default prop data = []
export const RiskVsPumpReadinessScatterPlot = ({ data = [] }) => (
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
        legend: "Pump Readiness Ratio (0.0 - 1.0)",
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
          <span className="text-gray-700">Pump Readiness Ratio: </span>
          <strong className="text-blue-600">{node.data.x.toFixed(3)}</strong>
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

// --- (กราฟ 4) Component กราฟที่ 4: Box Plot (Rainy Season by Cluster) ---
// (แก้) เพิ่ม default props data = [] และ groups = []
export const RainySeasonByClusterBoxPlot = ({ data = [], groups = [] }) => (
  <div style={{ height: "450px", width: "100%" }}>
    <ResponsiveBoxPlot
      data={data}
      groups={groups}
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
      axisTop={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Cluster",
        legendPosition: "middle",
        legendOffset: 46,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Avg. Rainy Season Rain (mm)",
        legendPosition: "middle",
        legendOffset: -50,
      }}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
              fill: "#333333",
            },
          },
          legend: {
            text: {
              fontSize: 14,
              fill: "#333333",
            },
          },
        },
        tooltip: {
          container: {
            background: "#ffffff",
          },
        },
      }}
      tooltip={({ group, value, data }) => (
        <div className="bg-white p-2 rounded shadow border w-48">
          <strong>{group}</strong>
          <br />
          {data ? (
            <>
              <span className="text-gray-700">Median: </span>
              <strong className="text-blue-600">
                {data.median?.toFixed(2) ?? "N/A"}
              </strong>
              <br />
              <span className="text-gray-700">Q1: </span>
              <strong className="text-blue-600">
                {data.q1?.toFixed(2) ?? "N/A"}
              </strong>
              <br />
              <span className="text-gray-700">Q3: </span>
              <strong className="text-blue-600">
                {data.q3?.toFixed(2) ?? "N/A"}
              </strong>
            </>
          ) : (
            <>
              <span className="text-gray-700">Outlier: </span>
              <strong className="text-blue-600">
                {value?.toFixed(2) ?? "N/A"}
              </strong>
            </>
          )}
        </div>
      )}
    />
  </div>
);

// --- Component หลัก (EdaCharts) ---
export default function EdaCharts() {
  return (
    <div>
      <h2 className="text-2xl font-bold">EDA Chart Components</h2>
      <p>This file exports multiple chart components for use in other pages.</p>
    </div>
  );
}
