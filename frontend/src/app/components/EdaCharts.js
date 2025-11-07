// frontend/src/app/components/EdaCharts.js
"use client";
import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { ResponsiveBoxPlot } from "@nivo/boxplot";

// Hardcode ข้อมูล Heatmap
const hardcodedHeatmapData = [
  {
    id: "Area",
    data: [
      { x: "Area", y: 1.0 },
      { x: "Canals", y: 0.53 },
      { x: "Risk Points", y: 0.57 },
      { x: "Pumps (Total)", y: 0.39 },
      { x: "Population", y: 0.53 },
    ],
  },
  {
    id: "Canals",
    data: [
      { x: "Area", y: 0.53 },
      { x: "Canals", y: 1.0 },
      { x: "Risk Points", y: 0.46 },
      { x: "Pumps (Total)", y: 0.29 },
      { x: "Population", y: 0.5 },
    ],
  },
  {
    id: "Risk Points",
    data: [
      { x: "Area", y: 0.57 },
      { x: "Canals", y: 0.46 },
      { x: "Risk Points", y: 1.0 },
      { x: "Pumps (Total)", y: 0.27 },
      { x: "Population", y: 0.56 },
    ],
  },
  {
    id: "Pumps (Total)",
    data: [
      { x: "Area", y: 0.39 },
      { x: "Canals", y: 0.29 },
      { x: "Risk Points", y: 0.27 },
      { x: "Pumps (Total)", y: 1.0 },
      { x: "Population", y: 0.5 },
    ],
  },
  {
    id: "Population",
    data: [
      { x: "Area", y: 0.53 },
      { x: "Canals", y: 0.5 },
      { x: "Risk Points", y: 0.56 },
      { x: "Pumps (Total)", y: 0.5 },
      { x: "Population", y: 1.0 },
    ],
  },
];

// สร้าง keys จากข้อมูล hardcode
const heatmapKeys = hardcodedHeatmapData[0].data.map((d) => d.x);

// --- กราฟ 4 ตัวเดิม (เปลี่ยนสี) ---
export const ClusterProfileBarChart = ({ data, keys }) => (
  <div style={{ height: "400px" }}>
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy="cluster"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "paired" }}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
    />
  </div>
);

export const RiskVsDensityScatterPlot = ({ data }) => (
  <div style={{ height: "400px" }}>
    <ResponsiveScatterPlot
      data={data}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "linear", min: "auto", max: "auto" }}
      yScale={{ type: "linear", min: "auto", max: "auto" }}
      blendMode="multiply"
      colors={{ scheme: "paired" }}
      tooltip={({ node }) => (
        <div
          style={{
            backgroundColor: "white",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          {/* (แก้ไข) เปลี่ยนสีตัวอักษร */}
          <strong style={{ color: "#333", fontWeight: "bold" }}>
            {node.data.name}
          </strong>
          <br />
          Risk: {node.formattedY}
          <br />
          Pop. Density: {node.formattedX}
        </div>
      )}
    />
  </div>
);

export const RiskVsPumpReadinessScatterPlot = ({ data }) => (
  <div style={{ height: "400px" }}>
    <ResponsiveScatterPlot
      data={data}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "linear", min: 0, max: "auto" }}
      yScale={{ type: "linear", min: "auto", max: "auto" }}
      blendMode="multiply"
      colors={{ scheme: "paired" }}
      tooltip={({ node }) => (
        <div
          style={{
            backgroundColor: "white",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          {/* (แก้ไข) เปลี่ยนสีตัวอักษร */}
          <strong style={{ color: "#333", fontWeight: "bold" }}>
            {node.data.name}
          </strong>
          <br />
          Risk: {node.formattedY}
          <br />
          Pump Readiness: {node.formattedX}
        </div>
      )}
    />
  </div>
);

export const RainySeasonByClusterBoxPlot = ({ data, groups }) => (
  <div style={{ height: "400px" }}>
    <ResponsiveBoxPlot
      data={data}
      groups={groups}
      margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
      valueScale={{ type: "linear", min: "auto", max: "auto" }}
      indexBy="group"
      colors={{ scheme: "paired" }}
      padding={0.5}
      enableGridX={false}
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
        legend: "Avg. Rainy Season (mm)",
        legendPosition: "middle",
        legendOffset: -50,
      }}
      tooltip={({ group, value }) => (
        <div
          style={{
            backgroundColor: "white",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "3px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <strong style={{ color: "#333" }}>
            {group}: {value?.toFixed(2)} mm
          </strong>
        </div>
      )}
    />
  </div>
);

// --- กราฟใหม่ 1: Histogram (ใช้ Bar Chart) ---
export const RainfallHistogram = ({ data }) => (
  <div style={{ height: "400px" }}>
    <ResponsiveBar
      data={data}
      keys={["count"]}
      indexBy="name"
      margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "paired" }}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ปริมาณฝน (mm)",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "จำนวนวัน",
        legendPosition: "middle",
        legendOffset: -50,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      animate={true}
      motionStiffness={90}
      motionDamping={15}
    />
  </div>
);

// --- กราฟใหม่ 2: Seasonal BoxPlot ---
export const SeasonalRainBoxPlot = ({ data, groups }) => (
  <div style={{ height: "400px" }}>
    <ResponsiveBoxPlot
      data={data}
      groups={groups}
      margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
      valueScale={{ type: "linear", min: "auto", max: "auto" }}
      indexBy="group"
      colors={{ scheme: "paired" }}
      padding={0.5}
      enableGridX={false}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ฤดูกาล",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "ปริมาณฝน (mm)",
        legendPosition: "middle",
        legendOffset: -50,
      }}
      tooltip={({ group, value }) => (
        <div
          style={{
            backgroundColor: "white",
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "3px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <strong style={{ color: "#333" }}>
            {group}: {value?.toFixed(2)} mm
          </strong>
        </div>
      )}
    />
  </div>
);

// --- กราฟใหม่ 3: Feature Heatmap (Custom Implementation) ---
export const FeatureHeatmap = () => {
  const getColor = (value) => {
    // สี diverging จาก -1 (น้ำเงิน) ถึง 0 (เหลือง) ถึง 1 (แดง)
    if (value >= 0.8) return "#d73027";
    if (value >= 0.6) return "#f46d43";
    if (value >= 0.4) return "#fdae61";
    if (value >= 0.2) return "#fee090";
    if (value >= -0.2) return "#ffffbf";
    if (value >= -0.4) return "#e0f3f8";
    if (value >= -0.6) return "#abd9e9";
    if (value >= -0.8) return "#74add1";
    return "#4575b4";
  };

  const labels = [
    "Area",
    "Canals",
    "Risk Points",
    "Pumps (Total)",
    "Population",
  ];

  return (
    <div style={{ height: "500px", padding: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `120px repeat(${labels.length}, 1fr)`,
          gap: "2px",
          fontSize: "12px",
        }}
      >
        {/* Header row */}
        <div></div>
        {labels.map((label, idx) => (
          <div
            key={`header-${idx}`}
            style={{
              padding: "8px",
              textAlign: "center",
              fontWeight: "bold",
              // transform: "rotate(-45deg)",
              transformOrigin: "center",
              height: "80px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              color: "#1f1f1f",
            }}
          >
            {label}
          </div>
        ))}

        {/* Data rows */}
        {hardcodedHeatmapData.map((row, rowIdx) => (
          <React.Fragment key={`row-${rowIdx}`}>
            <div
              style={{
                padding: "8px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                color: "#1f1f1f",
              }}
            >
              {row.id}
            </div>
            {row.data.map((cell, cellIdx) => (
              <div
                key={`cell-${rowIdx}-${cellIdx}`}
                style={{
                  backgroundColor: getColor(cell.y),
                  padding: "16px 8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  // (*** นี่คือจุดที่แก้ไข ***)
                  // เปลี่ยนเกณฑ์จาก 0.5 เป็น 0.6
                  color: Math.abs(cell.y) > 0.6 ? "white" : "black",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s",
                }}
                title={`${row.id} vs ${cell.x}: ${cell.y?.toFixed(2)}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.zIndex = "10";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.zIndex = "1";
                }}
              >
                {cell.y?.toFixed(2)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <div
          style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
        >
          <span style={{ fontSize: "12px", fontWeight: "bold" }}>-1.0</span>
          {[
            "#4575b4",
            "#74add1",
            "#abd9e9",
            "#e0f3f8",
            "#ffffbf",
            "#fee090",
            "#fdae61",
            "#f46d43",
            "#d73027",
          ].map((color, idx) => (
            <div
              key={idx}
              style={{
                width: "40px",
                height: "20px",
                backgroundColor: color,
                border: "1px solid #ddd",
              }}
            />
          ))}
          <span style={{ fontSize: "12px", fontWeight: "bold" }}>1.0</span>
        </div>
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
          Correlation (-1 to +1)
        </div>
      </div>
    </div>
  );
};
