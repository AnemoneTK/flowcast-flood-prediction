// frontend/src/app/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
  ArrowLeft,
  PieChart as PieIcon, // เปลี่ยน icon
  PieChartIcon,
} from "lucide-react";

// Import Charts
import {
  PumpStatusChart,
  ClusterDistributionChart, // Import ตัวใหม่
} from "../components/DashboardCharts";

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

        // --- เสริม: จัดเรียงข้อมูลน้ำท่วมให้ชัวร์ (Top 10) ---
        if (result.floodGraphData) {
          result.floodGraphData.sort((a, b) => a.floods - b.floods); // Nivo แนวนอนจะเรียงล่างขึ้นบน (น้อย->มาก)
        }

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
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        {/* --- Header --- */}
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
            {/* ================= OVERVIEW MODE ================= */}
            {data.mode === "overview" && (
              <>
                {/* 1. KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* ... (คงเดิม) ... */}
                  <KPICard
                    title={`ฝนสะสมสูงสุด `}
                    value={`${data.systemHealth.maxRain} mm`}
                    sub={`สูงสุดที่: ${data.systemHealth.maxRainDistrict}`}
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

                {/* 2. Map & Ranking */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-col overflow-hidden">
                    <div className="p-4 pb-2 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MapIcon className="text-blue-600" /> แผนที่ความเสี่ยง
                      </h3>
                      {/* ... Legend ... */}
                      <div className="flex gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>{" "}
                          เสี่ยงสูง
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>{" "}
                          เฝ้าระวัง
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>{" "}
                          ปกติ
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 w-full relative z-0 min-h-[500px]">
                      <InteractiveMap
                        selectedDcode="all"
                        onSelect={setSelectedDcode}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">
                      5 อันดับเขตเสี่ยงสูงสุด
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                      {data.topRisky.map((d, index) => (
                        <div
                          key={d.dcode}
                          onClick={() => setSelectedDcode(d.dcode)}
                          className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-100"
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
                                ความเสี่ยง: {d.riskLevel}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-red-600">
                              {d.riskScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Statistics (Flood History & Pump Health) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* กราฟ 1: น้ำท่วมย้อนหลัง (Sorted Top 10) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[450px]">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      สถิติน้ำท่วมย้อนหลัง (Top 10)
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                      เขตที่เกิดปัญหาน้ำท่วมบ่อยครั้งที่สุด
                    </p>
                    <div className="h-[320px]">
                      <ResponsiveBar
                        data={data.floodGraphData}
                        keys={["floods"]}
                        indexBy="dname"
                        margin={{ top: 10, right: 30, bottom: 50, left: 100 }}
                        padding={0.3}
                        layout="horizontal"
                        colors={["#3B82F6"]}
                        borderRadius={4}
                        axisLeft={{ tickSize: 0, tickPadding: 10 }}
                        axisBottom={{
                          legend: "จำนวนครั้งที่ท่วม",
                          legendPosition: "middle",
                          legendOffset: 40,
                        }}
                        enableGridX={true}
                        theme={{
                          axis: {
                            ticks: { text: { fontSize: 12, fill: "#64748b" } },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* กราฟ 2: Pump Status (Sorted by Broken Ratio) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[450px]">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-red-500" />
                      10 อันดับเขต ปั๊มชำรุดสูงสุด
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                      เรียงตามสัดส่วนเครื่องสูบที่ <u>ใช้งานไม่ได้</u>{" "}
                      ต่อจำนวนติดตั้งทั้งหมด
                    </p>
                    <div className="h-[320px]">
                      {/* ส่งข้อมูลดิบทั้งหมดไป เดี๋ยวใน Component จะ Sort เอง */}
                      <PumpStatusChart data={data.mapData} />
                    </div>
                  </div>
                </div>

                {/* 4. Overview Summary (Pie Chart) - แทน Risk Matrix */}
                {/* <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <PieChartIcon className="text-purple-600" />{" "}
                        สัดส่วนความเสี่ยงทั่ว กทม.
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        ภาพรวมการกระจายตัวของระดับความเสี่ยงทั้ง 50 เขต
                      </p>
                    </div>
                  </div>

                  <div className="h-[350px]">
                    <ClusterDistributionChart data={data.mapData} />
                  </div>
                </div> */}
              </>
            )}

            {/* ================= DETAIL MODE ================= */}
            {data.mode === "detail" && (
              <div className="space-y-8">
                {/* ... (ส่วน Detail Mode เหมือนเดิม) ... */}
                <div>
                  <button
                    onClick={() => setSelectedDcode(null)}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-white px-5 py-2.5 rounded-full transition-all font-medium shadow-sm bg-slate-100"
                  >
                    <ArrowLeft size={20} /> กลับไปดูภาพรวม
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-l-8 border-l-blue-500 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                    {/* ... ข้อมูลเขต ... */}
                    <div>
                      <h2 className="text-4xl font-bold text-slate-800">
                        {data.district.dname}
                      </h2>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                        Cluster {data.district.cluster}
                      </span>
                      <p className="text-slate-500 text-lg mt-2">
                        สถานะ:{" "}
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
                    <div className="flex gap-12 text-center md:mr-8">
                      <div>
                        <p className="text-slate-400 text-sm">ปริมาณฝน</p>
                        <p className="text-4xl font-bold text-blue-600">
                          {data.rainAmount}{" "}
                          <span className="text-lg font-normal text-slate-400">
                            mm
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">จุดเสี่ยง</p>
                        <p className="text-4xl font-bold text-red-500">
                          {data.district.flood_point_count}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Radar Chart & Map */}
                  <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] flex flex-col">
                    <h3 className="font-bold text-lg mb-2 text-center">
                      ศักยภาพโครงสร้างพื้นฐาน
                    </h3>
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
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-col overflow-hidden h-[500px]">
                    <div className="p-4 pb-2">
                      <h3 className="font-bold text-lg">
                        พื้นที่เขต: {data.district.dname}
                      </h3>
                    </div>
                    <div className="flex-1 relative z-0">
                      <InteractiveMap
                        selectedDcode={selectedDcode}
                        onSelect={setSelectedDcode}
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

// Helper KPI Card
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
