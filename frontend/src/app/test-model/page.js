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
  Map as MapIcon,
  Plus,
  Minus,
} from "lucide-react";

// --- Sub-Component: ตัวควบคุมตัวเลข (Slider + Input + Buttons) ---
const NumberControl = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  colorClass,
  onChange,
}) => {
  const handleManualChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    // ป้องกันค่าเกินขอบเขต
    if (val > max) val = max;
    if (val < min) val = min;
    onChange(val);
  };

  const adjustValue = (delta) => {
    let newVal = parseFloat(value) + delta;
    if (newVal > max) newVal = max;
    if (newVal < min) newVal = min;
    // ปัดทศนิยมให้สวยงามตาม step
    if (step < 1) newVal = parseFloat(newVal.toFixed(2));
    onChange(newVal);
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          {label}
        </label>
        <span className={`text-sm font-bold ${colorClass}`}>
          {value} {unit}
        </span>
      </div>

      {/* Control Row: Button - Input - Button */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => adjustValue(-step)}
          className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Minus size={16} />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleManualChange}
          className="flex-1 w-full text-center font-mono font-medium text-slate-800 bg-white border border-slate-300 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          onClick={() => adjustValue(step)}
          className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${
          colorClass.split("-")[1]
        }-600`}
      />
    </div>
  );
};

export default function TestModelPage() {
  const [selectedDcode, setSelectedDcode] = useState(null);

  // State เก็บข้อมูลเขต (รวมถึง Area)
  const [districtInfo, setDistrictInfo] = useState(null);

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
      // รีเซ็ตค่าก่อนโหลด
      setDistrictInfo(null);
      setResult(null);

      fetch(`/api/dashboard-analytics?dcode=${selectedDcode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.district) {
            // เก็บข้อมูลเขตทั้งหมด (น่าจะมี area อยู่ใน data.district)
            setDistrictInfo(data.district);

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
    setResult(null);

    try {
      const res = await fetch("/api/test-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dcode: selectedDcode, ...inputs }),
      });

      const data = await res.json();

      if (data.error) {
        console.error("API Error:", data.error);
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
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
          <Sliders className="text-blue-600" /> AI Sandbox & Simulation
        </h1>
        <p className="text-slate-500 mb-8">
          ทดลองปรับตัวแปรเพื่อดูผลลัพธ์การพยากรณ์จาก AI ทั้ง 3 โมเดล
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- INPUT PANEL --- */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-6">
            {/* Section 1: เลือกพื้นที่ */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapIcon size={20} className="text-slate-400" /> 1.
                พื้นที่เป้าหมาย
              </h3>
              <DistrictSelector onSelect={setSelectedDcode} />

              {/* ✅ แสดงข้อมูลขนาดพื้นที่ (ถ้ามีข้อมูล) */}
              {districtInfo && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex justify-between items-center animate-fade-in">
                  <span>ขนาดพื้นที่เขต:</span>
                  <span className="font-bold">
                    {districtInfo.area
                      ? (
                          parseFloat(districtInfo.area) / 1000000
                        ).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "-"}{" "}
                    ตร.กม.
                  </span>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: ปรับตัวแปร */}
            {selectedDcode && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sliders size={20} className="text-slate-400" /> 2. ปรับตัวแปร
                </h3>

                {/* ✅ ใช้ Component ใหม่ NumberControl */}
                <NumberControl
                  label="ปริมาณฝน (24 ชม.)"
                  value={inputs.rain_24h}
                  min={0}
                  max={500}
                  step={5}
                  unit="mm"
                  colorClass="text-blue-600"
                  onChange={(val) => setInputs({ ...inputs, rain_24h: val })}
                />

                <NumberControl
                  label="จำนวนเครื่องสูบน้ำ"
                  value={inputs.pump_number}
                  min={0}
                  max={50}
                  step={1}
                  unit="เครื่อง"
                  colorClass="text-green-600"
                  onChange={(val) => setInputs({ ...inputs, pump_number: val })}
                />

                <NumberControl
                  label="จำนวนคลองระบายน้ำ"
                  value={inputs.canal_count}
                  min={0}
                  max={100}
                  step={1}
                  unit="สาย"
                  colorClass="text-cyan-600"
                  onChange={(val) => setInputs({ ...inputs, canal_count: val })}
                />

                <button
                  onClick={handleRunTest}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 mt-4"
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
            {result && result.predictions ? (
              <div className="space-y-6 animate-fade-in-up">
                {/* Model Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(result.predictions).map(
                    ([modelName, res]) => (
                      <div
                        key={modelName}
                        className={`p-5 rounded-xl border shadow-sm text-center transition-all hover:shadow-md ${
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

                {/* Recommendation Card */}
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
                            จากการจำลองสถานการณ์ พบว่าพื้นที่{" "}
                            <strong>
                              {districtInfo?.dname || selectedDcode}
                            </strong>{" "}
                            มีความเสี่ยงสูงในสภาวะฝนตก {inputs.rain_24h} mm
                          </p>
                          {result.recommendation > 0 ? (
                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl inline-block">
                              <p className="font-bold text-purple-800 flex items-center gap-2">
                                <Zap size={18} /> ข้อเสนอแนะ:
                                ควรติดตั้งเครื่องสูบน้ำเพิ่ม{" "}
                                <span className="text-2xl">
                                  {result.recommendation}
                                </span>{" "}
                                เครื่อง
                              </p>
                              <p className="text-xs text-purple-600 mt-1">
                                (รวมเป็น{" "}
                                {parseFloat(inputs.pump_number) +
                                  result.recommendation}{" "}
                                เครื่อง) เพื่อลดความเสี่ยงเป็น Medium/Low
                              </p>
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                              <p className="text-red-600 font-bold flex items-center gap-2">
                                <AlertTriangle size={18} /> วิกฤต:
                                การเพิ่มปั๊มน้ำอาจไม่เพียงพอ
                              </p>
                              <p className="text-sm text-red-500 mt-1">
                                ปริมาณฝนเกินขีดความสามารถของระบบระบายน้ำ
                                แนะนำให้เตรียมแผนอพยพ
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-green-600 font-medium flex items-center gap-2">
                          <ShieldCheck size={18} />{" "}
                          ทรัพยากรปัจจุบันเพียงพอต่อการรับมือสถานการณ์นี้
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parameter Summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
                  <strong>AI Features Used:</strong> Rain Load:{" "}
                  {result.features.rain_load.toFixed(2)} | Pump Density:{" "}
                  {result.features.pump_density.toFixed(4)} | Canal Density:{" "}
                  {result.features.canal_density.toFixed(4)}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[400px]">
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
