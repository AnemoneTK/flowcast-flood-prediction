// frontend/src/app/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DistrictSelector from "../components/DistrictSelector";
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Map as MapIcon,
  ArrowLeft,
  Calendar,
  History,
  CheckCircle,
  Wind,
  Thermometer,
  TrendingUp,
  Umbrella,
  Zap, // ไอคอนสำหรับ Simulation
  RefreshCw, // ไอคอน Reset
} from "lucide-react";

// Charts
import {
  PumpStatusChart,
  ClusterDistributionChart,
  YearlyComparisonLineChart,
} from "../components/DashboardCharts";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsiveBar } from "@nivo/bar";

const InteractiveMap = dynamic(() => import("../components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">
      กำลังโหลดแผนที่...
    </div>
  ),
});

// ฟังก์ชัน Helper เดิม (คงไว้)
const getWeatherCondition = (code) => {
  const c = String(code);
  const map = {
    1: "ท้องฟ้าแจ่มใส",
    2: "มีเมฆบางส่วน",
    3: "เมฆเป็นส่วนมาก",
    4: "มีเมฆมาก",
    5: "ฝนตกเล็กน้อย",
    6: "ฝนปานกลาง",
    7: "ฝนตกหนัก",
    8: "ฝนฟ้าคะนอง",
    9: "อากาศหนาวจัด",
    10: "อากาศหนาว",
    11: "อากาศเย็น",
    12: "อากาศร้อนจัด",
  };
  return map[c] || c; // ถ้าเป็น Text อยู่แล้วก็คืนค่าเดิม
};
const getForecastRisk = (rain) => {
  const r = parseFloat(rain || 0);
  if (r >= 90)
    return {
      label: "เสี่ยงสูงมาก",
      color: "bg-red-100 text-red-700 border-red-200",
    };
  if (r >= 35)
    return {
      label: "เสี่ยงสูง",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    };
  if (r >= 10)
    return {
      label: "เฝ้าระวัง",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  return {
    label: "ปกติ",
    color: "bg-green-100 text-green-700 border-green-200",
  };
};

export default function DashboardPage() {
  const [selectedDcode, setSelectedDcode] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // State สำหรับ Mock Mode
  const [isSimulation, setIsSimulation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = `?date=${filterDate}`;
        if (selectedDcode) query += `&dcode=${selectedDcode}`;

        // ถ้าเปิด Simulation ให้ส่ง param ไปบอก API
        if (isSimulation) query += `&mock=true`;

        const res = await fetch(`/api/dashboard-analytics${query}`);
        const result = await res.json();
        if (result.floodGraphData)
          result.floodGraphData.sort((a, b) => a.floods - b.floods);
        setData(result);
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedDcode, filterDate, isSimulation]); // เพิ่ม isSimulation เป็น dependency

  const handleResetDate = () => {
    setFilterDate(new Date().toISOString().split("T")[0]);
    setIsSimulation(false); // ปิด Simulation เมื่อกลับสู่ปัจจุบัน
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              ระบบอัจฉริยะติดตามสถานการณ์น้ำท่วม
              {/* Badge แจ้งเตือนเมื่ออยู่ในโหมดจำลอง */}
              {isSimulation && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-200 flex items-center gap-2 animate-pulse">
                  <Zap size={16} className="fill-purple-700" />{" "}
                  โหมดจำลองเหตุการณ์ (Simulation)
                </span>
              )}
            </h1>

            <div className="flex items-center gap-3 mt-2">
              {!isSimulation ? (
                <span className="text-slate-500 text-lg font-medium flex items-center gap-2">
                  กำลังดูข้อมูลวันที่: {filterDate}
                </span>
              ) : null}
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-end gap-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {/* ปุ่ม Toggle Simulation */}
              <button
                onClick={() => setIsSimulation(!isSimulation)}
                className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-all ${
                  isSimulation
                    ? "bg-purple-600 text-white hover:bg-purple-700 border border-purple-600"
                    : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
                }`}
              >
                {isSimulation ? <RefreshCw size={16} /> : <Zap size={16} />}
                {isSimulation ? "ปิดการจำลอง" : "จำลองฝนตกหนัก"}
              </button>

              {/* Date Picker */}
              <div className="relative h-full">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setIsSimulation(false);
                  }}
                  className="pl-8 pr-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg focus:ring-blue-500 block h-full w-full md:w-48 shadow-sm font-medium cursor-pointer"
                  disabled={isSimulation} // ปิดเลือกวันเมื่อจำลอง
                />
              </div>

              {/* District Selector */}
              <div className="w-full md:w-72">
                <DistrictSelector onSelect={setSelectedDcode} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400 animate-pulse">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span>กำลังประมวลผลข้อมูล...</span>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* ================= OVERVIEW ================= */}
            {data.mode === "overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <KPICard
                    title="ฝนสะสม (24 ชม.)"
                    value={`${data.systemHealth.maxRain} มม.`}
                    sub={`ที่เขต: ${data.systemHealth.maxRainDistrict}`}
                    icon={<CloudRain size={24} />}
                    color={isSimulation ? "red" : "blue"}
                  />
                  <KPICard
                    title="เขตที่มีความเสี่ยง"
                    value={`${data.systemHealth.totalRiskCount} เขต`}
                    sub="เสี่ยงสูง + เฝ้าระวัง"
                    icon={<AlertTriangle size={24} />}
                    color={
                      data.systemHealth.totalRiskCount > 0 ? "orange" : "green"
                    }
                  />
                  <KPICard
                    title="ความพร้อมเครื่องสูบน้ำ"
                    value={`${data.systemHealth.activePumps}%`}
                    sub="ประสิทธิภาพภาพรวม"
                    icon={<Droplets size={24} />}
                    color="green"
                  />
                  <KPICard
                    title="จุดเสี่ยงน้ำท่วมสะสม"
                    value="45 จุด"
                    sub="ทั่วกรุงเทพฯ"
                    icon={<MapIcon size={24} />}
                    color="red"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-col overflow-hidden">
                    <div className="p-4 pb-2 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MapIcon className="text-blue-600" /> แผนที่ความเสี่ยง
                        AI
                      </h3>
                    </div>
                    <div className="flex-1 w-full relative z-0 min-h-[500px]">
                      <InteractiveMap
                        selectedDcode="all"
                        onSelect={setSelectedDcode}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <div className="mb-4 border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <span className="text-red-500">●</span> 5
                        อันดับเขตเสี่ยงสูงสุด
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> ข้อมูล:{" "}
                        <strong>
                          {isSimulation
                            ? "จำลองเหตุการณ์ (Simulation)"
                            : data.systemHealth.rainDateLabel}
                        </strong>
                      </p>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                      {data.topRisky.length > 0 ? (
                        data.topRisky.map((d, index) => (
                          <div
                            key={d.dcode}
                            onClick={() => setSelectedDcode(d.dcode)}
                            className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-100 hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                                  index === 0
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "bg-white border border-slate-200 text-slate-500"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-bold text-slate-700 group-hover:text-red-700 transition-colors">
                                  {d.dname}
                                </p>
                                <p className="text-xs text-slate-400 group-hover:text-red-400">
                                  ภาระน้ำฝน: {Math.round(d.rainLoad)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-2 py-1 text-xs font-bold rounded-lg ${
                                  d.riskLevel === "High"
                                    ? "bg-red-100 text-red-700"
                                    : d.riskLevel === "Medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {d.riskLevel === "High"
                                  ? "เสี่ยงสูง"
                                  : d.riskLevel === "Medium"
                                  ? "เฝ้าระวัง"
                                  : "เสี่ยงต่ำ"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[96%] text-center space-y-3 bg-green-50/50 rounded-xl border border-green-100/50 m-2">
                          <div className="p-3 bg-green-100 rounded-full text-green-500">
                            <CheckCircle size={32} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-green-800">
                              สถานการณ์ปกติ
                            </h4>
                            <p className="text-xs text-green-600 px-4">
                              ไม่พบเขตที่มีความเสี่ยงสูงในวันนี้
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {data.systemHealth.lastHighRiskDate &&
                      !data.systemHealth.isHistoricalView &&
                      !isSimulation && (
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-slate-100 rounded-b-2xl">
                          <button
                            onClick={() =>
                              handleViewHistory(
                                data.systemHealth.lastHighRiskDate
                              )
                            }
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-blue-50 hover:text-blue-700 transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <History
                                size={18}
                                className="text-slate-400 group-hover:text-blue-500"
                              />
                              <span>
                                ดูวันวิกฤตล่าสุด (
                                {data.systemHealth.lastHighRiskDate})
                              </span>
                            </div>
                          </button>
                        </div>
                      )}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[450px]">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      สถิติน้ำท่วมย้อนหลัง
                    </h3>
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
                        enableLabel={false}
                        theme={{
                          axis: {
                            ticks: { text: { fontSize: 12, fill: "#64748b" } },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[450px]">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-orange-500" /> 10
                      อันดับเขต ปั๊มชำรุดสูงสุด
                    </h3>
                    <div className="h-[320px]">
                      <PumpStatusChart data={data.mapData} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= DETAIL MODE ================= */}
            {data.mode === "detail" && (
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedDcode(null)}
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-white px-4 py-2 rounded-lg transition-all font-medium bg-slate-100 border border-slate-200"
                >
                  <ArrowLeft size={18} /> กลับไปหน้าภาพรวม
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div
                    className={`lg:col-span-2 p-8 rounded-3xl shadow-lg flex flex-col justify-center relative overflow-hidden text-white ${
                      data.district.riskLevel === "High" ||
                      data.district.riskLevel === "High Risk"
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : data.district.riskLevel === "Medium"
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : "bg-gradient-to-br from-emerald-400 to-green-600"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2 opacity-90">
                        <MapIcon size={20} />{" "}
                        <span>
                          {data.district.dname} (รหัส: {data.district.dcode})
                        </span>
                      </div>
                      <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
                        สถานะ:{" "}
                        {data.district.riskLevel === "High" ||
                        data.district.riskLevel === "High Risk"
                          ? "เสี่ยงสูง 🚨"
                          : data.district.riskLevel === "Medium"
                          ? "เฝ้าระวัง ⚠️"
                          : "ปกติ ✅"}
                      </h2>
                      <p className="opacity-80 text-sm">
                        {isSimulation
                          ? "ข้อมูลจากการจำลองสถานการณ์ (Simulation)"
                          : `ข้อมูลประจำวันที่ ${filterDate}`}
                      </p>
                    </div>
                  </div>
                  {/* ... (Pump & Flood Cards) ... */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 mb-3">
                      <Droplets size={32} />
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      เครื่องสูบน้ำ
                    </h3>
                    <div className="mt-2">
                      <span className="text-4xl font-black text-slate-800">
                        {data.district.pump_number}
                      </span>
                    </div>
                    <div className="mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                      พร้อมใช้ {data.district.pump_ready}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                    <div className="p-3 bg-red-50 rounded-2xl text-red-500 mb-3">
                      <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      จุดเสี่ยงน้ำท่วม
                    </h3>
                    <div className="mt-2">
                      <span className="text-4xl font-black text-slate-800">
                        {data.district.flood_point_count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Forecast Cards */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Umbrella className="text-blue-500" />{" "}
                    {isSimulation
                      ? "พยากรณ์ (จำลอง)"
                      : "พยากรณ์อากาศ 3 วันล่วงหน้า"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.forecast && data.forecast.length > 0 ? (
                      data.forecast.map((f, i) => {
                        const risk = getForecastRisk(f.rain_24h);
                        return (
                          <div
                            key={i}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                          >
                            <div
                              className={`absolute top-0 left-0 w-1.5 h-full ${
                                risk.color.split(" ")[0]
                              }`}
                            ></div>
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-sm font-bold text-slate-500">
                                {f.date}
                              </p>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${risk.color}`}
                              >
                                {risk.label}
                              </span>
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-lg font-bold text-slate-800">
                                  {getWeatherCondition(f.condition)}
                                </p>
                                <div className="flex gap-3 mt-2 text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Thermometer size={12} /> {f.temp_max}°C
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Wind size={12} /> {f.humidity}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-3xl font-extrabold text-blue-600">
                                  {f.rain_24h}
                                </span>
                                <span className="text-xs text-blue-400">
                                  mm
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-3 bg-slate-50 p-8 rounded-2xl text-center text-slate-400 border border-dashed border-slate-300">
                        ไม่มีข้อมูลพยากรณ์
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="text-purple-600" />{" "}
                        ปริมาณฝนสะสมรายเดือน (3 ปีย้อนหลัง)
                      </h3>
                    </div>
                    <YearlyComparisonLineChart data={data.rainSeries} />
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-1 text-center">
                      ศักยภาพการรับมือ
                    </h3>
                    <div className="flex-1 min-h-[250px]">
                      <ResponsiveRadar
                        data={data.radarData}
                        keys={["value", "average"]}
                        indexBy="feature"
                        maxValue="auto"
                        margin={{ top: 30, right: 60, bottom: 30, left: 60 }}
                        curve="linearClosed"
                        borderWidth={2}
                        borderColor={{ from: "color" }}
                        gridLevels={4}
                        gridShape="circular"
                        enableDots={true}
                        colors={["#2563EB", "#94A3B8"]}
                        fillOpacity={0.2}
                        blendMode="multiply"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-1 rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-[400px] relative z-0">
                  <InteractiveMap
                    selectedDcode={selectedDcode}
                    onSelect={setSelectedDcode}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper KPI Card (เหมือนเดิม)
function KPICard({ title, value, sub, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1 group-hover:scale-105 transition-transform origin-left">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]} shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded-md">
        {sub}
      </p>
    </div>
  );
}
