"use client";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveCalendar } from "@nivo/calendar";

// --- 1. กราฟปฏิทินความเสี่ยง (Risk Calendar) ---
// แสดงจุดสีแดงในวันที่เสี่ยงสูง
export function RiskCalendar({ data }) {
  // แปลง data ให้เข้า format Nivo Calendar: { day: '2024-09-15', value: 100 }
  const calendarData = data.map((item) => ({
    day: item.date,
    value: item.is_high_risk ? 100 : item.rain_24h > 0 ? item.rain_24h : 0,
  }));

  return (
    <div style={{ height: 250 }}>
      <ResponsiveCalendar
        data={calendarData}
        from="2024-01-01"
        to="2024-12-31"
        emptyColor="#eeeeee"
        colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        legends={[
          {
            anchor: "bottom-right",
            direction: "row",
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: "right-to-left",
          },
        ]}
      />
    </div>
  );
}

// --- 2. กราฟวินิจฉัยสาเหตุ (Diagnosis Bar) ---
// เปรียบเทียบ Rain vs Capacity
export function DiagnosisChart({ event }) {
  if (!event) return null;

  // สร้างข้อมูลเปรียบเทียบ
  // 1. ปริมาณฝนจริง
  // 2. ขีดจำกัดที่ปั๊มรับไหว (สมมติปั๊ม 1 ตัวรับได้ 20mm)
  const pumpCapacity = event.pump_number * 20;

  const data = [
    {
      category: "สาเหตุ (Factor)",
      "ปริมาณฝน (Rain)": event.rain_24h,
      "ขีดความสามารถปั๊ม (Pump Cap.)": pumpCapacity,
    },
  ];

  return (
    <div style={{ height: 300 }}>
      <ResponsiveBar
        data={data}
        keys={["ปริมาณฝน (Rain)", "ขีดความสามารถปั๊ม (Pump Cap.)"]}
        indexBy="category"
        margin={{ top: 30, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        groupMode="grouped"
        colors={["#ef4444", "#3b82f6"]} // แดง (ฝน), ฟ้า (ปั๊ม)
        axisBottom={{ tickSize: 0, tickPadding: 5, tickRotation: 0 }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "mm / capacity",
          legendPosition: "middle",
          legendOffset: -40,
        }}
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
        tooltip={({ id, value, color }) => (
          <div
            className="p-2 bg-white border rounded shadow text-sm font-bold"
            style={{ color }}
          >
            {id}: {value.toFixed(1)}
          </div>
        )}
      />
    </div>
  );
}
