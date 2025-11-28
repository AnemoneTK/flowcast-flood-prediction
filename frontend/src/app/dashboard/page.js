"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  BarChart3,
  CloudRain,
  AlertTriangle,
  Zap,
  X,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../components/Navbar";
import InteractiveMap from "../components/InteractiveMap";
import {
  RainfallComparisonChart,
  RiskRankingChart,
  DistrictRadarChart,
  ClusterDistributionChart,
} from "../components/DashboardCharts";
import DistrictSelector from "../components/DistrictSelector";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  // --- Data State ---
  const [districtsList, setDistrictsList] = useState([]); // รายชื่อเขตทั้งหมด (สำหรับ Search)
  const [rainData, setRainData] = useState([]);
  const [rankingData, setRankingData] = useState([]);

  // --- View State ---
  const [selectedDistricts, setSelectedDistricts] = useState([]); // เขตที่เลือก (Array)
  const [compareRainData, setCompareRainData] = useState([]);
  const [forecastStats, setForecastStats] = useState({
    high: 0,
    med: 0,
    low: 0,
  });
  const [historyStats, setHistoryStats] = useState({ high: 0, med: 0, low: 0 });
  const [bkkAvg, setBkkAvg] = useState({});
  const [loading, setLoading] = useState(true);

  // --- Initial Load ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูล Analytics (รวม District Info + L2 Score)
        const analyticsRes = await fetch("/api/analytics");
        const analytics = await analyticsRes.json();

        setDistrictsList(analytics.allDistricts); // เก็บ Master Data
        setRankingData(analytics.ranking);
        setHistoryStats(analytics.historyStats);

        // คำนวณ BKK Avg จากข้อมูลจริง
        const dList = analytics.allDistricts;
        if (dList.length > 0) {
          setBkkAvg({
            pump_number:
              dList.reduce((s, d) => s + d.pump_number, 0) / dList.length,
            flood_point_count:
              dList.reduce((s, d) => s + d.flood_point_count, 0) / dList.length,
            pump_density: 0.5,
            canal_density: 0.5,
            rain_load: 50, // Mock scale items
          });
        }

        // 2. ดึงกราฟฝนรายปี
        const rainRes = await fetch("/api/rainfall");
        setRainData(await rainRes.json());

        // 3. คำนวณ Forecast Stats (L3)
        const high = dList.filter((d) => d.risk_level === "High Risk").length;
        const med = dList.filter((d) => d.risk_level === "Well Managed").length;
        const low = dList.filter((d) => d.risk_level === "Low Risk").length;
        setForecastStats({ high, med, low });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Comparison Data Fetcher ---
  useEffect(() => {
    if (selectedDistricts.length > 0) {
      // ดึงกราฟฝนเฉพาะเขตที่เลือก
      const dcodes = selectedDistricts.map((d) => d.dcode).join(",");
      fetch(`/api/rainfall/compare?dcodes=${dcodes}`)
        .then((res) => res.json())
        .then(setCompareRainData);
    }
  }, [selectedDistricts]);

  // --- Handlers ---
  const handleSelect = (district) => {
    if (
      selectedDistricts.length < 3 &&
      !selectedDistricts.find((d) => d.dcode === district.dcode)
    ) {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const handleRemove = (district) => {
    setSelectedDistricts(
      selectedDistricts.filter((d) => d.dcode !== district.dcode)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* 1. Control Panel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                <MapPin size={24} />
              </div>
              FlowCast Monitor
            </h1>
            <p className="text-slate-500 mt-1 ml-1">
              ระบบสนับสนุนการตัดสินใจและพยากรณ์น้ำท่วม (L4 DSS)
            </p>
          </div>

          <div className="w-full lg:w-1/2">
            <DistrictSelector
              districts={districtsList}
              selected={selectedDistricts}
              onSelect={handleSelect}
              onRemove={handleRemove}
            />
          </div>
        </div>

        {/* 2. Display Logic Switcher */}
        <AnimatePresence mode="wait">
          {/* CASE A: NO SELECTION -> SHOW OVERVIEW (ภาพรวม) */}
          {selectedDistricts.length === 0 && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="เขตเสี่ยงสูง (Forecast)"
                  value={forecastStats.high}
                  icon={<Zap />}
                  color="red"
                  label="3 วันล่วงหน้า"
                />
                <StatCard
                  title="เขตเปราะบาง (Structural)"
                  value={historyStats.high}
                  icon={<AlertTriangle />}
                  color="orange"
                  label="จุดเสี่ยงเยอะ"
                />
                <StatCard
                  title="พื้นที่ปลอดภัย"
                  value={forecastStats.low}
                  icon={<CloudRain />}
                  color="green"
                  label="ปกติ"
                />
                <StatCard
                  title="ปริมาณฝนเฉลี่ย"
                  value="0.0"
                  icon={<BarChart3 />}
                  color="blue"
                  label="มม./วัน (วันนี้)"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                    <CloudRain className="text-blue-500" />{" "}
                    ปริมาณฝนเฉลี่ยรายเดือน (2023-2024)
                  </h3>
                  {loading ? (
                    <div className="h-[300px] animate-pulse bg-slate-100 rounded-xl" />
                  ) : (
                    <RainfallComparisonChart data={rainData} />
                  )}
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" /> 10
                    อันดับเขตเปราะบาง (Structural Risk)
                  </h3>
                  {loading ? (
                    <div className="h-[300px] animate-pulse bg-slate-100 rounded-xl" />
                  ) : (
                    <RiskRankingChart data={rankingData} />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CASE B: SINGLE DISTRICT -> SHOW INSIGHT (เจาะลึก) */}
          {selectedDistricts.length === 1 && (
            <motion.div
              key="single"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left: Info Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 w-full h-2 ${
                      selectedDistricts[0].risk_level === "High Risk"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />
                  <h2 className="text-3xl font-extrabold text-slate-800">
                    {selectedDistricts[0].dname}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Code: {selectedDistricts[0].dcode}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 ${
                        selectedDistricts[0].risk_level === "High Risk"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {selectedDistricts[0].risk_level === "High Risk" ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <CloudRain size={16} />
                      )}
                      {selectedDistricts[0].risk_level}
                    </span>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                    <DetailBox
                      label="ปั๊มน้ำ"
                      value={selectedDistricts[0].pump_number}
                      unit="เครื่อง"
                    />
                    <DetailBox
                      label="จุดเสี่ยง"
                      value={selectedDistricts[0].flood_point_count}
                      unit="จุด"
                      highlight={selectedDistricts[0].flood_point_count > 5}
                    />
                    <DetailBox
                      label="คลอง"
                      value={selectedDistricts[0].canal_count}
                      unit="สาย"
                    />
                    <DetailBox
                      label="ประชากร"
                      value={selectedDistricts[0].population?.toLocaleString()}
                      unit="คน"
                    />
                  </div>
                </div>

                {/* L4 Action */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm ${
                    selectedDistricts[0].recommended_pumps > 0
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <h4
                    className={`font-bold mb-2 flex items-center gap-2 ${
                      selectedDistricts[0].recommended_pumps > 0
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  >
                    <Zap size={20} /> AI Recommendation (L4)
                  </h4>
                  {selectedDistricts[0].recommended_pumps > 0 ? (
                    <div>
                      <p className="text-sm text-red-700 mb-3">
                        มีความเสี่ยงสูง! แนะนำให้เพิ่มทรัพยากร:
                      </p>
                      <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm">
                        <span className="text-3xl font-extrabold text-red-600">
                          +{selectedDistricts[0].recommended_pumps}
                        </span>
                        <span className="text-sm font-bold text-slate-700">
                          เครื่องสูบน้ำ
                          <br />
                          <span className="font-normal text-slate-400 text-xs">
                            Mobile Unit
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700">
                      สถานการณ์ปกติ โครงสร้างพื้นฐานเพียงพอ
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Charts */}
              <div className="lg:col-span-8 space-y-6">
                {/* Rain History Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-700 mb-4">
                    ปริมาณฝนรายเขต (เปรียบเทียบปี 2024)
                  </h3>
                  <RainfallComparisonChart data={compareRainData} />
                </div>
                {/* Radar Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="font-bold text-slate-700 mb-2">
                      Structural Analysis (L2)
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      เปรียบเทียบศักยภาพของ {selectedDistricts[0].dname}{" "}
                      (สีน้ำเงิน) กับค่าเฉลี่ย กทม. (สีเทา) เพื่อหาจุดอ่อน
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>
                        • หากกราฟเบ้ไปทาง <strong>จุดเสี่ยง</strong>{" "}
                        แสดงว่าพื้นที่มีความเปราะบางสูง
                      </li>
                      <li>
                        • หากกราฟเบ้ไปทาง <strong>ปั๊มน้ำ</strong>{" "}
                        แสดงว่ามีความพร้อมดี
                      </li>
                    </ul>
                  </div>
                  <DistrictRadarChart
                    data={selectedDistricts[0]}
                    avgData={bkkAvg}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* CASE C: COMPARISON MODE (>1) */}
          {selectedDistricts.length > 1 && (
            <motion.div
              key="compare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="text-indigo-500" />
                  เปรียบเทียบ {selectedDistricts.length} เขต
                </h3>
                <RainfallComparisonChart data={compareRainData} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedDistricts.map((d) => (
                  <div
                    key={d.dcode}
                    className="bg-white p-6 rounded-3xl shadow-md border border-slate-100"
                  >
                    <h4 className="font-bold text-lg mb-2">{d.dname}</h4>
                    <DistrictRadarChart data={d} avgData={bkkAvg} />
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-sm">
                      <span>
                        ปั๊ม: <strong>{d.pump_number}</strong>
                      </span>
                      <span>
                        จุดเสี่ยง:{" "}
                        <strong className="text-red-500">
                          {d.flood_point_count}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Components ---
function StatCard({ title, value, icon, color, label }) {
  const styles = {
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div
      className={`p-6 rounded-2xl flex items-start justify-between ${styles[color]}`}
    >
      <div>
        <div className="text-sm font-medium opacity-80 mb-1">{title}</div>
        <div className="text-3xl font-extrabold">{value}</div>
        <div className="text-xs opacity-70 mt-1">{label}</div>
      </div>
      <div className="p-2 bg-white/50 rounded-lg">{icon}</div>
    </div>
  );
}

function DetailBox({ label, value, unit, highlight }) {
  return (
    <div
      className={`p-3 rounded-xl border ${
        highlight
          ? "bg-orange-50 border-orange-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="font-bold text-slate-800">
        {value}{" "}
        <span className="text-xs font-normal text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
