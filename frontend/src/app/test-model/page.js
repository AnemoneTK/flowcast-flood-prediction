// frontend/src/app/test-model/page.js
"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import DistrictSelector from "../components/DistrictSelector";
import {
  Sliders,
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function TestModelPage() {
  const [selectedDcode, setSelectedDcode] = useState(null);

  // Input State
  const [inputs, setInputs] = useState({
    rain_24h: 60,
    pump_number: 5,
    canal_count: 10,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // โหลดค่าเริ่มต้นเมื่อเลือกเขต
  useEffect(() => {
    if (selectedDcode) {
      fetch(`/api/dashboard-analytics?dcode=${selectedDcode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.district) {
            setInputs({
              rain_24h: data.rainAmount || 60,
              pump_number: data.district.pump_number || 5,
              canal_count: data.district.canal_count || 10,
            });
          }
        })
        .catch((err) => console.error("Error fetching district info:", err));
    }
  }, [selectedDcode]);

  const handleRunTest = async () => {
    if (!selectedDcode) return alert("กรุณาเลือกเขตก่อน");
    setLoading(true);
    setResult(null); // Reset previous result

    try {
      const res = await fetch("/api/test-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dcode: selectedDcode, ...inputs }),
      });

      const data = await res.json();

      // ✅ เพิ่มการเช็ค Error จาก API
      if (data.error) {
        console.error("API Error:", data.error);
        // แสดง Error ที่ได้จาก Python Script (เช่น Module not found)
        alert(`เกิดข้อผิดพลาดในการประมวลผล: ${data.error}`);
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Network/Client Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
          <Sliders className="text-blue-600" /> AI Sandbox & Simulation
        </h1>
        <p className="text-slate-500 mb-8">
          ทดลองปรับตัวแปรเพื่อดูผลลัพธ์การพยากรณ์จาก AI ทั้ง 3 โมเดล
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- INPUT PANEL --- */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-lg mb-4">1. กำหนดสถานการณ์</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                เลือกเขตพื้นที่
              </label>
              <DistrictSelector onSelect={setSelectedDcode} />
            </div>

            {selectedDcode && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      ปริมาณฝน (24 ชม.)
                    </label>
                    <span className="text-sm font-bold text-blue-600">
                      {inputs.rain_24h} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="5"
                    value={inputs.rain_24h}
                    onChange={(e) =>
                      setInputs({ ...inputs, rain_24h: e.target.value })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      จำนวนเครื่องสูบน้ำ
                    </label>
                    <span className="text-sm font-bold text-green-600">
                      {inputs.pump_number} เครื่อง
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={inputs.pump_number}
                    onChange={(e) =>
                      setInputs({ ...inputs, pump_number: e.target.value })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      จำนวนคลอง
                    </label>
                    <span className="text-sm font-bold text-cyan-600">
                      {inputs.canal_count} สาย
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.canal_count}
                    onChange={(e) =>
                      setInputs({ ...inputs, canal_count: e.target.value })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                <button
                  onClick={handleRunTest}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
                >
                  {loading ? (
                    "กำลังคำนวณ..."
                  ) : (
                    <>
                      <Zap size={20} /> ประมวลผล AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* --- RESULT PANEL --- */}
          <div className="lg:col-span-2">
            {/* ✅ เช็คว่ามี result และ result.predictions หรือไม่ ก่อนแสดงผล */}
            {result && result.predictions ? (
              <div className="space-y-6 animate-fade-in-up">
                {/* Model Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(result.predictions).map(
                    ([modelName, res]) => (
                      <div
                        key={modelName}
                        className={`p-5 rounded-xl border shadow-sm text-center ${
                          res.risk === "High Risk"
                            ? "bg-red-50 border-red-100"
                            : res.risk === "Medium"
                            ? "bg-yellow-50 border-yellow-100"
                            : "bg-green-50 border-green-100"
                        }`}
                      >
                        <p className="text-slate-500 text-sm font-semibold mb-1">
                          {modelName}
                        </p>
                        <h4
                          className={`text-2xl font-extrabold ${
                            res.risk === "High Risk"
                              ? "text-red-600"
                              : res.risk === "Medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {res.risk}
                        </h4>
                        <p className="text-xs text-slate-400 mt-2">
                          Confidence: {res.confidence}%
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* Recommendation Card (L4) */}
                <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        คำแนะนำเชิงป้องกัน (Prescriptive Analytics)
                      </h3>
                      {result.predictions["XGBoost"].risk === "High Risk" ? (
                        <div>
                          <p className="text-slate-600 mb-4">
                            จากการจำลองสถานการณ์
                            พบว่าพื้นที่นี้มีความเสี่ยงสูงในสภาวะฝนตก{" "}
                            {inputs.rain_24h} mm
                          </p>
                          {result.recommendation > 0 ? (
                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl inline-block">
                              <p className="font-bold text-purple-800 flex items-center gap-2">
                                <Zap size={18} /> ข้อเสนอแนะ:
                                ควรติดตั้งเครื่องสูบน้ำเพิ่ม{" "}
                                {result.recommendation} เครื่อง
                              </p>
                              <p className="text-xs text-purple-600 mt-1">
                                เพื่อลดระดับความเสี่ยงลงสู่ระดับที่ควบคุมได้
                                (Medium/Low)
                              </p>
                            </div>
                          ) : (
                            <p className="text-red-500 font-medium">
                              สถานการณ์วิกฤตมาก!
                              การเพิ่มเครื่องสูบน้ำอาจไม่เพียงพอ
                              ต้องใช้มาตรการอพยพหรือระบายน้ำทางอื่นร่วมด้วย
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-green-600 font-medium flex items-center gap-2">
                          <CheckCircle size={18} />{" "}
                          ทรัพยากรปัจจุบันเพียงพอต่อการรับมือสถานการณ์นี้
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parameter Summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
                  <strong>Parameters Used:</strong> Rain Load:{" "}
                  {result.features.rain_load.toFixed(2)} | Pump Density:{" "}
                  {result.features.pump_density.toFixed(4)} | Canal Density:{" "}
                  {result.features.canal_density.toFixed(4)}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[300px]">
                <Activity size={48} className="mb-4 opacity-50" />
                <p>เลือกเขตและปรับค่าตัวแปรด้านซ้าย เพื่อเริ่มการจำลอง</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
