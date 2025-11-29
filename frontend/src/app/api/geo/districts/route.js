// src/app/api/geo/districts/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // ดึงแค่ dcode กับ dname เพื่อให้โหลดเร็ว
    const { data, error } = await supabase
      .from("districts")
      .select("dcode, dname")
      .order("dname", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
