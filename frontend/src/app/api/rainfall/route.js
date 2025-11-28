import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // เรียกใช้ RPC Function ที่เราเพิ่งสร้าง
    const { data, error } = await supabase.rpc("get_monthly_rainfall");
    if (error) throw error;

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
    const years = [2023, 2024, 2025];
    const colors = { 2023: "#cbd5e1", 2024: "#3b82f6", 2025: "#f59e0b" }; // เทา, ฟ้า, ส้ม

    const chartData = years.map((year) => ({
      id: year.toString(),
      color: colors[year],
      data: months.map((mStr, index) => {
        const monthIndex = index + 1;
        const record = data.find(
          (d) => d.year === year && d.month === monthIndex
        );
        return {
          x: mStr,
          y: record ? parseFloat(record.avg_rain.toFixed(2)) : 0,
        };
      }),
    }));

    return NextResponse.json(chartData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
