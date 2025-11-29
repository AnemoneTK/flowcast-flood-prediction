// src/app/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import DistrictSelector from "../components/DistrictSelector";

// Dynamic import map
const InteractiveMap = dynamic(() => import("../components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl border border-slate-200">
      <span className="animate-pulse">กำลังโหลดแผนที่...</span>
    </div>
  ),
});

import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveRadar } from "@nivo/radar";
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Map as MapIcon,
  ArrowUpRight,
  ArrowLeft, // เพิ่มไอคอนลูกศรซ้าย
} from "lucide-react";

export default function DashboardPage() {
  const [selectedDcode, setSelectedDcode] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = selectedDcode ? `?dcode=${selectedDcode}` : "";
        const res = await fetch(`/api/dashboard-analytics${query}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedDcode]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* --- Header & Search --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Flood Monitoring Intelligence
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {selectedDcode
                ? `กำลังวิเคราะห์ข้อมูลเชิงลึก: ${
                    data?.district?.dname || "..."
                  }`
                : "ภาพรวมสถานการณ์น้ำท่วมกรุงเทพมหานคร"}
            </p>
          </div>
          <div className="w-full md:w-96">
            <DistrictSelector onSelect={setSelectedDcode} />
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center text-blue-500 animate-pulse text-lg">
            กำลังประมวลผลข้อมูล...
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* =========================================================
                SECTION 1: OVERVIEW & MAP (แสดงเมื่อยังไม่เลือกเขต) 
               ========================================================= */}
            {data.mode === "overview" && (
              <>
                {/* 1.1 KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <KPICard
                    title="ฝนสะสมวันนี้"
                    value={`${data.systemHealth.maxRain} mm`}
                    sub="สูงสุดที่เขตหลักสี่"
                    icon={<CloudRain size={24} />}
                    color="blue"
                  />
                  <KPICard
                    title="ความเสี่ยงภาพรวม"
                    value="Medium"
                    sub="เฝ้าระวัง 12 เขต"
                    icon={<AlertTriangle size={24} />}
                    color="orange"
                  />
                  <KPICard
                    title="ปั๊มน้ำพร้อมใช้งาน"
                    value={`${data.systemHealth.activePumps}%`}
                    sub="จาก 50 เขต"
                    icon={<Droplets size={24} />}
                    color="green"
                  />
                  <KPICard
                    title="จุดเสี่ยงทั้งหมด"
                    value="45 จุด"
                    sub="ที่เคยท่วมซ้ำซาก"
                    icon={<MapIcon size={24} />}
                    color="red"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
                  {/* 1.2 RISK MAP */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-col overflow-hidden">
                    <div className="p-4 pb-2 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MapIcon className="text-blue-600" /> แผนที่ความเสี่ยง
                        (Risk Map)
                      </h3>
                      <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>{" "}
                          เสี่ยงสูง (Cluster 2)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-yellow-400"></span>{" "}
                          เฝ้าระวัง (Cluster 1)
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 w-full h-[500px] relative z-0">
                      <InteractiveMap
                        key="map-overview"
                        selectedDcode={selectedDcode || "all"}
                        onSelect={setSelectedDcode} // <--- เพิ่มบรรทัดนี้ เพื่อให้กดปุ่มใน Popup แล้วเปลี่ยนหน้าได้
                      />
                    </div>
                  </div>

                  {/* 1.3 TOP RISKY RANKING */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">
                      5 อันดับเขตเสี่ยงสูงสุด
                    </h3>
                    <div className="space-y-4">
                      {data.topRisky.map((d, index) => (
                        <div
                          key={d.dcode}
                          onClick={() => setSelectedDcode(d.dcode)}
                          className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-100"
                          title="คลิกเพื่อดูรายละเอียดเขตนี้"
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                                index === 0
                                  ? "bg-red-500 text-white"
                                  : "bg-white border border-slate-200 text-slate-500"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-700 group-hover:text-red-700 transition-colors">
                                {d.dname}
                              </p>
                              <p className="text-xs text-slate-400">
                                ปัจจัย: ฝนตกหนัก
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-red-600">
                              {d.riskScore}
                            </span>
                            <span className="text-xs text-red-400 block">
                              % ความเสี่ยง
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1.4 HISTORICAL CHART */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[400px]">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    สถิติน้ำท่วมย้อนหลัง (Historical Flood Frequency)
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    เปรียบเทียบจำนวนครั้งที่เกิดน้ำท่วมในแต่ละเขต (อดีต)
                  </p>
                  <ResponsiveBar
                    data={data.floodGraphData}
                    keys={["floods"]}
                    indexBy="dname"
                    margin={{ top: 10, right: 30, bottom: 50, left: 100 }}
                    padding={0.3}
                    layout="horizontal"
                    colors={["#3B82F6"]}
                    borderRadius={4}
                    axisLeft={{ tickSize: 0, tickPadding: 10, tickRotation: 0 }}
                    axisBottom={{
                      legend: "จำนวนครั้งที่ท่วม",
                      legendPosition: "middle",
                      legendOffset: 40,
                    }}
                    enableGridX={true}
                    enableGridY={false}
                    theme={{
                      axis: {
                        ticks: { text: { fontSize: 12, fill: "#64748b" } },
                      },
                    }}
                  />
                </div>
              </>
            )}

            {/* =========================================================
                SECTION 2: DEEP DIVE (แสดงเมื่อเลือกเขต)
               ========================================================= */}
            {data.mode === "detail" && (
              <div className="space-y-6">
                {/* --- ปุ่มย้อนกลับ (ย้ายมาอยู่นอก Card เพื่อแก้ปัญหาซ้อนทับ) --- */}
                <div>
                  <button
                    onClick={() => setSelectedDcode(null)}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-full transition-all font-medium shadow-sm"
                  >
                    <ArrowLeft size={20} /> กลับไปดูภาพรวม (Back to Overview)
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 2.1 STATUS CARD */}
                  <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-l-8 border-l-blue-500 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-4xl font-bold text-slate-800">
                          {data.district.dname}
                        </h2>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                          Cluster {data.district.cluster}
                        </span>
                      </div>
                      <p className="text-slate-500 text-lg">
                        สถานะความเสี่ยงปัจจุบัน:{" "}
                        <span
                          className={`font-bold ${
                            data.district.riskLevel === "High"
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {data.district.riskLevel}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-8 text-center md:mr-8">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">
                          ปริมาณฝนวันนี้
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          45{" "}
                          <span className="text-sm font-normal text-slate-400">
                            mm
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">
                          จุดเสี่ยง (อดีต)
                        </p>
                        <p className="text-3xl font-bold text-red-500">
                          {data.district.flood_point_count}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2.2 RADAR CHART */}
                  <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[450px] flex flex-col">
                    <h3 className="font-bold text-lg mb-4 text-center">
                      ศักยภาพโครงสร้างพื้นฐาน
                    </h3>
                    <p className="text-xs text-center text-slate-400 mb-4">
                      เทียบกับค่าเฉลี่ยของกลุ่ม (Cluster)
                    </p>
                    <div className="flex-1">
                      <ResponsiveRadar
                        data={data.radarData}
                        keys={["value", "average"]}
                        indexBy="feature"
                        maxValue="auto"
                        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
                        curve="linearClosed"
                        borderWidth={2}
                        borderColor={{ from: "color" }}
                        gridLevels={5}
                        gridShape="circular"
                        enableDots={true}
                        dotSize={8}
                        colors={["#2563EB", "#CBD5E1"]}
                        fillOpacity={0.2}
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
                      />
                    </div>
                  </div>

                  {/* 2.3 Map & Info */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-col overflow-hidden h-[450px]">
                    <div className="p-4 pb-2 flex justify-between">
                      <h3 className="font-bold text-lg">
                        พื้นที่เขต: {data.district.dname}
                      </h3>
                    </div>
                    <div className="flex-1 relative z-0">
                      <InteractiveMap
                        key={`map-detail-${selectedDcode}`}
                        selectedDcode={selectedDcode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function KPICard({ title, value, sub, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-xs text-slate-400 font-medium">{sub}</p>
    </div>
  );
}
