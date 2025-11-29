// frontend/src/app/api/test-model/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ⚠️ URL ของ Backend Python ที่คุณ Deploy แล้ว (เช่น https://flowcast-api.onrender.com)
// แนะนำให้เก็บใน .env เป็น process.env.PYTHON_API_URL
const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();
    const { dcode, rain_24h, pump_number, canal_count } = body;

    // 1. ดึงข้อมูล Static ของเขต (เหมือนเดิม)
    const { data: district } = await supabase
      .from("districts")
      .select("area, population, flood_point_count")
      .eq("dcode", dcode)
      .single();

    if (!district) {
      return NextResponse.json(
        { error: "District not found" },
        { status: 404 }
      );
    }

    // 2. เตรียมข้อมูล (เหมือนเดิม)
    const inputData = {
      rain_24h: parseFloat(rain_24h),
      pump_number: parseFloat(pump_number),
      canal_count: parseFloat(canal_count),
      area: district.area,
      population: district.population,
      flood_point_count: district.flood_point_count,
    };

    // 3. ✅ เปลี่ยนจากการรัน Script เอง เป็นการเรียก API ภายนอก
    const pythonResponse = await fetch(`${PYTHON_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputData),
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python API Error: ${pythonResponse.statusText}`);
    }

    const result = await pythonResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}
