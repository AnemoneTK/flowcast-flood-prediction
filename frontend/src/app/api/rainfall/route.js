import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 1. ดึงข้อมูลฝนจริง (History) ทั้งหมด
    // เลือกเฉพาะวันที่และปริมาณฝน (is_forecast = false)
    const { data, error } = await supabase
      .from("rain_logs")
      .select("date, rain_24h")
      .eq("is_forecast", false);

    if (error) throw error;

    // 2. ประมวลผลข้อมูล (Aggregation) ในระดับปีและเดือน
    // { '2023-0': [10, 20, ...], '2023-1': [...] }
    const groupedData = {};

    data.forEach((row) => {
      const date = new Date(row.date);
      if (isNaN(date)) return; // ข้ามถ้าวันที่ไม่ถูกต้อง

      const year = date.getFullYear();
      const month = date.getMonth(); // 0 = Jan, 11 = Dec
      const key = `${year}-${month}`;

      if (!groupedData[key]) groupedData[key] = { sum: 0, count: 0 };

      groupedData[key].sum += row.rain_24h;
      groupedData[key].count += 1;
    });

    // 3. จัด Format ให้ตรงกับ Nivo Line Chart
    // [ { id: '2023', data: [{x:'Jan', y:10}, ...] }, ... ]
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const years = [2023, 2024, 2025]; // ปีที่เราสนใจ
    const colors = { 2023: "#94a3b8", 2024: "#3b82f6", 2025: "#f59e0b" }; // เทา, ฟ้า, ส้ม

    const chartData = years.map((year) => {
      return {
        id: year.toString(),
        color: colors[year],
        data: months.map((monthName, index) => {
          const key = `${year}-${index}`;
          const group = groupedData[key];
          // หาค่าเฉลี่ย (ถ้าไม่มีข้อมูลให้เป็น 0)
          const avgRain = group ? group.sum / group.count : 0;
          return { x: monthName, y: avgRain };
        }),
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
