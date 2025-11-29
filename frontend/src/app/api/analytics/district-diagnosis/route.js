// src/app/api/analytics/district-diagnosis/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dcode = searchParams.get("dcode"); // อาจจะเป็น null ถ้าไม่ได้เลือก

  try {
    let districtData;
    let comparisonData; // ข้อมูลที่จะเอามาเทียบ (เช่น ค่าเฉลี่ยกลุ่ม หรือ ค่าเฉลี่ยกทม.)

    if (dcode && dcode !== "null") {
      // --- CASE 1: เลือกเขต (Drill Down) ---

      // ดึงข้อมูลเขตนั้น
      const { data: dist, error: distError } = await supabase
        .from("districts")
        .select("*")
        .eq("dcode", dcode)
        .single();
      if (distError) throw distError;
      districtData = dist;

      // ดึงค่าเฉลี่ยของ Cluster ตัวเองมาเทียบ
      const { data: clusterStats } = await supabase
        .from("districts")
        .select("canal_count, pump_number, flood_point_count")
        .eq("cluster", dist.cluster);
      comparisonData = clusterStats;
    } else {
      // --- CASE 2: ไม่เลือกเขต (Overview / Global View) ---

      // คำนวณค่าเฉลี่ยของ "ทั้งกรุงเทพฯ"
      const { data: allDistricts, error: allError } = await supabase
        .from("districts")
        .select("*");
      if (allError) throw allError;

      // สร้างข้อมูลจำลองของ "กรุงเทพมหานคร"
      const totalPumps = allDistricts.reduce(
        (sum, d) => sum + (d.pump_number || 0),
        0
      );
      const readyPumps = allDistricts.reduce(
        (sum, d) => sum + (d.pump_ready || 0),
        0
      );
      comparisonData = allDistricts; // เทียบกับตัวเอง (ค่าเฉลี่ยรวม)

      districtData = {
        dname: "ภาพรวมกรุงเทพมหานคร",
        cluster: -1, // พิเศษ
        flood_point_count: allDistricts.reduce(
          (sum, d) => sum + (d.flood_point_count || 0),
          0
        ),
        canal_count: allDistricts.reduce(
          (sum, d) => sum + (d.canal_count || 0),
          0
        ),
        pump_number: totalPumps,
        pump_ready: readyPumps,
        risk_points: 0, // คำนวณตาม logic รวม
      };
    }

    // --- ส่วนคำนวณกราฟ (ใช้ร่วมกัน) ---
    // คำนวณค่าเฉลี่ยของกลุ่มเปรียบเทียบ
    const totalCount = comparisonData.length;
    const avg = comparisonData.reduce(
      (acc, curr) => ({
        canal: acc.canal + (curr.canal_count || 0),
        pump: acc.pump + (curr.pump_number || 0),
        risk: acc.risk + (curr.flood_point_count || 0),
      }),
      { canal: 0, pump: 0, risk: 0 }
    );

    const benchmark = {
      canal: avg.canal / totalCount,
      pump: avg.pump / totalCount,
      risk: avg.risk / totalCount,
    };

    // Normalize Data 0-100 สำหรับกราฟ Radar
    // ใช้ logic ต่างกันเล็กน้อย: ถ้าดูภาพรวม จะเทียบกับ "ค่าเฉลี่ยรายเขต"
    const isOverview = !dcode || dcode === "null";
    const normalize = (val, max) => Math.min((val / max) * 100, 100);

    // ถ้าเป็นภาพรวม เราจะหารเฉลี่ยให้เป็น "ต่อเขต" เพื่อให้พล็อตกราฟได้สวยๆ
    const plotVal = isOverview
      ? {
          canal: districtData.canal_count / 50, // 50 เขต
          pump: districtData.pump_number / 50,
          risk: districtData.flood_point_count / 50,
        }
      : {
          canal: districtData.canal_count,
          pump: districtData.pump_number,
          risk: districtData.flood_point_count,
        };

    const radarData = [
      {
        feature: "ศักยภาพคลอง",
        [isOverview ? "เฉลี่ยต่อเขต" : districtData.dname]: normalize(
          plotVal.canal,
          50
        ),
        "ค่ามาตรฐาน กทม.": normalize(benchmark.canal, 50),
      },
      {
        feature: "จำนวนปั๊มน้ำ",
        [isOverview ? "เฉลี่ยต่อเขต" : districtData.dname]: normalize(
          plotVal.pump,
          20
        ),
        "ค่ามาตรฐาน กทม.": normalize(benchmark.pump, 20),
      },
      {
        feature: "จุดเสี่ยงน้ำท่วม",
        [isOverview ? "เฉลี่ยต่อเขต" : districtData.dname]: normalize(
          plotVal.risk,
          15
        ),
        "ค่ามาตรฐาน กทม.": normalize(benchmark.risk, 15),
      },
    ];

    return NextResponse.json({ district: districtData, radarData });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
