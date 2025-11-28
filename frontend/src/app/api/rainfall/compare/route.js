import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dcodesParam = searchParams.get("dcodes"); // รับค่าแบบ "1001,1002,1003"

  if (!dcodesParam) {
    return NextResponse.json({ error: "No dcodes provided" }, { status: 400 });
  }

  const dcodes = dcodesParam.split(",").map(Number);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 1. ดึงข้อมูลฝนจริง (Historical) ของเขตที่เลือก
    // เลือกปี 2024 (หรือปีล่าสุดที่มีข้อมูลสมบูรณ์) มาเปรียบเทียบ
    const targetYear = 2024;

    const { data, error } = await supabase
      .from("rain_logs")
      .select("dcode, date, rain_24h")
      .in("dcode", dcodes)
      .eq("is_forecast", false)
      .gte("date", `${targetYear}-01-01`)
      .lte("date", `${targetYear}-12-31`);

    if (error) throw error;

    // 2. Group Data ตาม เขต -> เดือน
    const grouped = {};

    // Init storage
    dcodes.forEach((d) => {
      grouped[d] = Array(12)
        .fill(0)
        .map(() => ({ sum: 0, count: 0 }));
    });

    data.forEach((row) => {
      const m = new Date(row.date).getMonth(); // 0-11
      if (grouped[row.dcode]) {
        grouped[row.dcode][m].sum += row.rain_24h;
        grouped[row.dcode][m].count += 1;
      }
    });

    // 3. ดึงชื่อเขตมาใส่ในกราฟ
    const { data: districts } = await supabase
      .from("districts")
      .select("dcode, dname")
      .in("dcode", dcodes);

    const nameMap = {};
    districts.forEach((d) => (nameMap[d.dcode] = d.dname));

    // 4. Format for Nivo Line Chart
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
    const colors = ["#3b82f6", "#ef4444", "#10b981"]; // ฟ้า, แดง, เขียว

    const chartData = dcodes.map((code, idx) => {
      return {
        id: nameMap[code] || `Code ${code}`,
        color: colors[idx % colors.length],
        data: months.map((mStr, mIdx) => {
          const g = grouped[code][mIdx];
          const avg = g.count > 0 ? g.sum / g.count : 0;
          return { x: mStr, y: parseFloat(avg.toFixed(2)) };
        }),
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
