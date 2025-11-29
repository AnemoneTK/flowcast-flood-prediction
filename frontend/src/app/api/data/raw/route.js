// src/app/api/data/raw/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // ดึงข้อมูลดิบพื้นฐานของเขต (Static Data)
    const { data, error } = await supabase
      .from("districts")
      .select(
        "dcode, dname, area, population, canal_count, pump_number, risk_points"
      )
      .order("dcode", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
