// frontend/src/app/api/test-model/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs"; // ✅ เพิ่ม fs เพื่อเช็คไฟล์

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { dcode, rain_24h, pump_number, canal_count } = body;

    // 1. ดึงข้อมูล Static ของเขต
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

    // 2. เตรียมข้อมูล
    const inputData = {
      rain_24h: parseFloat(rain_24h),
      pump_number: parseFloat(pump_number),
      canal_count: parseFloat(canal_count),
      area: district.area,
      population: district.population,
      flood_point_count: district.flood_point_count,
    };

    // 3. กำหนด Path
    // หาตำแหน่ง script (ถอยจาก frontend/src/app/api/test-model ไปที่ root/scripts)
    const scriptPath = path.resolve(process.cwd(), "../scripts/api_predict.py");

    // ✅ FIX: หา Python ใน .venv ให้เจอ
    const isWindows = process.platform === "win32";
    // ถอยจาก frontend ออกไปที่ root เพื่อหา .venv
    const venvDir = path.resolve(process.cwd(), "../.venv");

    // ลองเช็คว่ามีไฟล์ python ใน .venv หรือไม่
    let pythonExec = "python"; // ค่า Default (Global)

    const venvPythonPath = isWindows
      ? path.join(venvDir, "Scripts", "python.exe") // Windows
      : path.join(venvDir, "bin", "python"); // Mac/Linux

    if (fs.existsSync(venvPythonPath)) {
      pythonExec = venvPythonPath; // ถ้าเจอ ให้ใช้ตัวนี้
      // console.log("Using venv python:", pythonExec);
    } else {
      // console.log("venv python not found, using global python");
    }

    // 4. รัน Python Script
    const runPython = () =>
      new Promise((resolve, reject) => {
        // Escape double quotes for JSON string
        const jsonArg = JSON.stringify(inputData).replace(/"/g, '\\"');

        // ใช้ path ของ python ที่หามาได้
        const command = `"${pythonExec}" "${scriptPath}" "${jsonArg}"`;

        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error("Python Execution Error:", stderr);
            // ส่ง stderr กลับไปเพื่อให้รู้ว่า error อะไร (เช่น module missing)
            reject(stderr || error.message);
          } else {
            try {
              const result = JSON.parse(stdout);
              resolve(result);
            } catch (e) {
              reject("Failed to parse Python output: " + stdout);
            }
          }
        });
      });

    const result = await runPython();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 500 });
  }
}
