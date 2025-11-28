"use client";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsiveLine } from "@nivo/line";

export function DistrictRadarChart({ data, avgData }) {
  // L2 Logic: วิเคราะห์โครงสร้างเขต (Structural Analysis)
  // เปรียบเทียบกับค่าเฉลี่ย กทม. (BKK Avg)

  // คำนวณ Density (ถ้ายังไม่มี)
  const districtPumpDen = (data.pump_number / data.area) * 1000000; // ปั๊มต่อ ตร.กม.
  const districtCanalDen = (data.canal_count / data.area) * 1000000;

  // Normalize (0-100) โดยเทียบกับค่า Max สมมติ (หรือค่าเฉลี่ย x 2)
  const normalize = (val, max) => Math.min((val / max) * 100, 100);

  const chartData = [
    {
      metric: "ความหนาแน่นปั๊ม", // ยิ่งเยอะยิ่งดี (Capacity)
      District: normalize(districtPumpDen, avgData.pump_density * 2.5),
      "BKK Avg": 50, // ค่าเฉลี่ยอยู่ตรงกลางเสมอ
      type: "capacity",
    },
    {
      metric: "ความหนาแน่นคลอง", // ยิ่งเยอะยิ่งดี (Capacity)
      District: normalize(districtCanalDen, avgData.canal_density * 2.5),
      "BKK Avg": 50,
      type: "capacity",
    },
    {
      metric: "จุดเสี่ยงน้ำท่วม", // ยิ่งเยอะยิ่งแย่ (Vulnerability)
      District: normalize(data.flood_point_count, 20),
      "BKK Avg": normalize(avgData.flood_point_count, 20),
      type: "risk",
    },
    {
      metric: "ประชากร", // ยิ่งเยอะยิ่ง Impact สูง
      District: normalize(data.population, 150000),
      "BKK Avg": normalize(avgData.population, 150000),
      type: "risk",
    },
    {
      metric: "เครื่องสูบน้ำ", // จำนวนดิบ
      District: normalize(data.pump_number, 20),
      "BKK Avg": normalize(avgData.pump_number, 20),
      type: "capacity",
    },
  ];

  return (
    <div style={{ height: 350 }}>
      <ResponsiveRadar
        data={chartData}
        keys={["District", "BKK Avg"]}
        indexBy="metric"
        maxValue={100}
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor={{ from: "color" }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={36}
        enableDots={true}
        dotSize={8}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        dotBorderColor={{ from: "color" }}
        colors={["#3b82f6", "#cbd5e1"]} // น้ำเงิน (เขต), เทา (ค่าเฉลี่ย)
        fillOpacity={0.3}
        blendMode="multiply"
        legends={[
          {
            anchor: "top-left",
            direction: "column",
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: "#999",
            symbolSize: 12,
            symbolShape: "circle",
          },
        ]}
        theme={{
          text: { fontSize: 12, fill: "#334155" },
          tooltip: {
            container: {
              background: "#ffffff",
              color: "#333333",
              fontSize: 13,
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      />
      <div className="text-center text-xs text-slate-400 mt-[-20px]">
        * เปรียบเทียบศักยภาพโครงสร้างพื้นฐาน (L2 Diagnostic)
      </div>
    </div>
  );
}

export function RainfallComparisonChart({ data }) {
  // ถ้าไม่มีข้อมูล ให้แสดง Loading หรือ Mock ว่างๆ
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        กำลังโหลดข้อมูลฝน...
      </div>
    );

  return (
    <div style={{ height: 300 }}>
      <ResponsiveLine
        data={data}
        colors={{ datum: "color" }} // ใช้สีที่ส่งมาจาก API
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
        curve="monotoneX" // เส้นโค้งสวยๆ
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
          legend: "Avg Rain (mm)",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={8}
        pointColor={{ theme: "background" }}
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
            effects: [{ on: "hover", style: { itemOpacity: 1 } }],
          },
        ]}
        theme={{
          text: { fontSize: 12, fill: "#64748b" },
          tooltip: {
            container: {
              background: "#ffffff",
              color: "#333333",
              fontSize: 12,
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      />
    </div>
  );
}
