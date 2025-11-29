// frontend/src/app/models/page.js
"use client";
import { useState, useEffect } from "react";
import {
  ClusterComparison,
  ModelComparisonChart,
  KSelectionChart,
  ClusterProfileTable,
} from "../components/ModelCharts";
import Navbar from "../components/Navbar";
import {
  CheckCircle2,
  BrainCircuit,
  GitBranch,
  Zap,
  Activity,
  Trophy,
  Info,
  Lightbulb,
} from "lucide-react";

export default function ModelPage() {
  const [clusterData, setClusterData] = useState({ k3: [], k4: [], k6: [] });
  const [modelData, setModelData] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/model-info")
      .then((res) => res.json())
      .then((data) => {
        setClusterData(data.clusters);
        setModelData(data.modelMetrics);
        setProfileData(data.clusterProfile);
        setLoading(false);
      });
  }, []);

  // --- ข้อมูลโมเดลและเหตุผลการเลือก ---
  const modelsList = [
    {
      id: "xgboost",
      name: "XGBoost",
      type: "Gradient Boosting",
      accuracy: "100%",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
      bgBadge: "bg-yellow-100 text-yellow-800",
      isChampion: true,
      reasonTitle: "Why Champion?",
      reason:
        "เป็นโมเดลประเภท Boosting ที่เรียนรู้จากข้อผิดพลาดของโมเดลก่อนหน้าซ้ำๆ ทำให้เก็บรายละเอียด Pattern ที่ซับซ้อนของข้อมูลน้ำท่วมได้ดีที่สุด (State-of-the-Art for Tabular Data)",
    },
    {
      id: "random_forest",
      name: "Random Forest",
      type: "Ensemble Bagging",
      accuracy: "99.6%",
      icon: GitBranch,
      color: "from-blue-400 to-indigo-500",
      textColor: "text-blue-600",
      borderColor: "border-slate-200",
      bgBadge: "bg-blue-100 text-blue-800",
      isChampion: false,
      reasonTitle: "Why Selected?",
      reason:
        "ใช้เทคนิค Bagging (สร้างต้นไม้หลายต้นแล้วโหวต) ช่วยลดความแปรปรวน (Variance) และป้องกัน Overfitting ได้ดี เหมาะกับการเป็นตัวเปรียบเทียบความเสถียร",
    },
    {
      id: "logistic",
      name: "Logistic Regression",
      type: "Linear Model",
      accuracy: "98.8%",
      icon: BrainCircuit,
      color: "from-emerald-400 to-green-500",
      textColor: "text-emerald-600",
      borderColor: "border-slate-200",
      bgBadge: "bg-emerald-100 text-emerald-800",
      isChampion: false,
      reasonTitle: "Why Baseline?",
      reason:
        "เป็นโมเดลพื้นฐานที่เรียบง่ายและประมวลผลไวที่สุด ใช้เป็นเกณฑ์มาตรฐาน (Baseline) เพื่อดูว่าข้อมูลมีความซับซ้อนเกินกว่าความสัมพันธ์เชิงเส้นหรือไม่",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 space-y-24">
        {/* --- HEADER --- */}
        <section className="text-center space-y-6 py-10 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Behind the AI
            </span>{" "}
            Architecture
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            เจาะลึกกระบวนการคิดของระบบ FlowCast:
            จากการค้นหาแพทเทิร์นความเสี่ยงด้วย
            <strong> Unsupervised Learning</strong> สู่การพยากรณ์แม่นยำระดับ
            100% ด้วย
            <strong> Supervised Learning</strong>
          </p>
        </section>

        {/* --- PART 1.1: Finding K --- */}
        <section className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-200">
              1
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Finding Optimal K
              </h2>
              <p className="text-slate-500 font-medium">
                การเลือกจำนวนกลุ่มที่เหมาะสมที่สุดด้วยวิธีทางสถิติ
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-10 items-start">
            {/* Left: Analysis & Reason */}
            <div className="md:col-span-5 space-y-6">
              <div className="p-2">
                <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                  Elbow & Silhouette Analysis
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  เราใช้ 2
                  เทคนิคนี้เพื่อหาจุดสมดุลระหว่างความละเอียดของการแบ่งกลุ่มและความชัดเจนของข้อมูล
                </p>
                <ul className="space-y-4 text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <li className="flex items-start gap-3">
                    <span className="w-3 h-3 mt-1.5 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-300"></span>
                    <span>
                      <strong>Inertia (Elbow):</strong>{" "}
                      ค่าความคลาดเคลื่อนลดลงอย่างรวดเร็วและเริ่มคงที่ที่{" "}
                      <strong>K=3</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-3 h-3 mt-1.5 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-300"></span>
                    <span>
                      <strong>Silhouette Score:</strong>{" "}
                      ค่าความชัดเจนเริ่มตกลงหลังจาก K=3 แสดงว่ากลุ่มเริ่มปนกัน
                    </span>
                  </li>
                </ul>
              </div>

              {/* --- New: Rationale Box (Why Finding K?) --- */}
              <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      Why do we need Optimal K?
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      การกำหนดค่า K (จำนวนกลุ่ม) เป็นหัวใจสำคัญของ K-Means
                      หากเลือก <strong>K น้อยไป</strong>{" "}
                      กลุ่มจะกว้างเกินจนไม่เห็นความเสี่ยงที่ซ่อนอยู่ แต่หาก{" "}
                      <strong>K มากไป</strong>{" "}
                      กลุ่มจะซอยย่อยเกินจนนำไปกำหนดนโยบายยาก เราจึงต้องหาจุด
                      {"Sweet Spot"} ทางคณิตศาสตร์ที่ K=3
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl text-center font-bold shadow-md">
                🎯 บทสรุป: เลือก K=3 (High / Medium / Low Risk)
              </div>
            </div>

            {/* Right: Chart */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full">
              <KSelectionChart />
            </div>
          </div>
        </section>

        {/* --- PART 1.2: Visualizing Clusters --- */}
        <section className="scroll-mt-20 relative overflow-hidden bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-200">
              2
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Cluster Visualization (PCA)
              </h2>
              <p className="text-slate-500 font-medium">
                เปรียบเทียบผลลัพธ์การจัดกลุ่มในมิติที่ลดลง
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Panel: Explanation & Table */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  Cluster Characterization
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  ตาราง Heatmap ด้านล่างแสดงคุณลักษณะเด่นของแต่ละกลุ่ม
                  โดยสีที่เข้มหมายถึงค่าเฉลี่ยที่สูงกว่ากลุ่มอื่นอย่างมีนัยสำคัญ
                  (ของปี 2024)
                </p>

                {loading ? (
                  <div className="h-40 bg-slate-100 animate-pulse rounded-xl"></div>
                ) : (
                  <ClusterProfileTable data={profileData} />
                )}
              </div>
              <div className="mt-6 space-y-3">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-green-500 rounded-full shrink-0 shadow-sm shadow-green-300"></div>
                  <div>
                    <h4 className="text-sm font-bold text-green-800">
                      Cluster 0: Low Risk (กลุ่มความเสี่ยงต่ำ)
                    </h4>
                    <p className="text-xs text-green-700/80 mt-1">
                      พื้นที่ที่มีค่าเฉลี่ยทุกด้านอยู่ในเกณฑ์ต่ำ
                      ทั้งปริมาณฝนและภาระปั๊ม ทำให้มีความเสี่ยงน้อยที่สุด
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-red-500 rounded-full shrink-0 shadow-sm shadow-red-300"></div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800">
                      Cluster 1: High Risk (กลุ่มเสี่ยงสูง)
                    </h4>
                    <p className="text-xs text-red-600/80 mt-1">
                      พื้นที่ที่มีค่า <strong>Rain Load สูงที่สุด</strong>{" "}
                      (ฝนตกหนักแต่ปั๊มน้ำไม่เพียงพอ) มีความเสี่ยงน้ำท่วมขังสูง
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-yellow-500 rounded-full shrink-0 shadow-sm shadow-yellow-300"></div>
                  <div>
                    <h4 className="text-sm font-bold text-yellow-800">
                      Cluster 2: Well Managed (กลุ่มเฝ้าระวัง)
                    </h4>
                    <p className="text-xs text-yellow-700/80 mt-1">
                      พื้นที่ที่มีฝนตกและประชากรหนาแน่น แต่มี{" "}
                      <strong>Pump Density สูง</strong>{" "}
                      ทำให้สามารถรับมือและระบายน้ำได้ทันท่วงที
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm relative min-h-[500px]">
              <ClusterComparison
                dataK3={clusterData.k3}
                dataK4={clusterData.k4}
                dataK6={clusterData.k6}
              />
              <div className="flex flex-col gap-2 text-sm text-slate-600 px-2">
                <p>
                  ✅ <strong>K=3 (Selected):</strong> กลุ่มแยกกันชัดเจน
                  สอดคล้องกับระดับความเสี่ยง
                </p>
                <p>
                  ⚠️ <strong>K=4:</strong> เริ่มมีการซอยกลุ่มย่อยที่ทับซ้อนกัน
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- PART 3: Model Benchmarking --- */}
        <section className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

          <div className="flex items-center gap-5 mb-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-600 text-white font-bold text-3xl shadow-lg shadow-purple-200">
              3
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-800">
                Model Benchmarking
              </h2>
              <p className="text-slate-500 text-lg font-medium mt-1">
                การคัดเลือก Champion Model จากการทดสอบประสิทธิภาพ 3 รูปแบบ
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Panel: Model Cards with Reasons */}
            <div className="lg:col-span-5 space-y-6">
              {modelsList.map((model) => (
                <div
                  key={model.id}
                  className={`relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                    model.isChampion
                      ? "bg-slate-900 border-slate-800 text-white shadow-2xl ring-4 ring-yellow-400/20 scale-[1.02] z-10"
                      : `bg-white hover:shadow-lg ${model.borderColor}`
                  }`}
                >
                  {/* Champion Badge */}
                  {model.isChampion && (
                    <div className="absolute -top-4 -right-4">
                      <div className="relative flex h-10 w-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-10 w-10 bg-yellow-500 items-center justify-center shadow-lg border-2 border-white">
                          <Trophy className="w-5 h-5 text-white" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl bg-gradient-to-br ${model.color} text-white shadow-md`}
                      >
                        <model.icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold leading-tight">
                          {model.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            model.isChampion
                              ? "bg-slate-700 text-slate-300"
                              : model.bgBadge
                          }`}
                        >
                          {model.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-3xl font-extrabold leading-none ${
                          model.isChampion ? "text-yellow-400" : model.textColor
                        }`}
                      >
                        {model.accuracy}
                      </p>
                      <p
                        className={`text-[10px] uppercase font-semibold mt-1 ${
                          model.isChampion ? "text-slate-400" : "text-slate-400"
                        }`}
                      >
                        Accuracy
                      </p>
                    </div>
                  </div>

                  {/* Reason Box */}
                  <div
                    className={`mt-4 p-4 rounded-2xl text-sm leading-relaxed border ${
                      model.isChampion
                        ? "bg-slate-800/50 border-slate-700 text-slate-300"
                        : "bg-slate-50/80 border-slate-100 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Info
                        className={`w-4 h-4 ${
                          model.isChampion
                            ? "text-yellow-500"
                            : "text-slate-400"
                        }`}
                      />
                      <strong
                        className={`${
                          model.isChampion ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {model.reasonTitle}
                      </strong>
                    </div>
                    {model.reason}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Panel: Performance Chart */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex-grow bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl relative">
                <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="text-purple-600 w-6 h-6" />
                    </div>
                    Performance Comparison
                  </h3>
                  <div className="flex gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>{" "}
                      Accuracy
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>{" "}
                      F1-Score
                    </div>
                  </div>
                </div>

                <div className="w-full h-[500px]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 animate-pulse">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-500 rounded-full animate-spin"></div>
                      <span className="font-medium">
                        Loading Performance Data...
                      </span>
                    </div>
                  ) : (
                    <ModelComparisonChart data={modelData} />
                  )}
                </div>

                <div className="mt-8 p-5 bg-green-50 rounded-3xl border border-green-100 flex gap-4 items-start">
                  <div className="p-2 bg-green-100 rounded-full shrink-0">
                    <CheckCircle2 className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 text-base">
                      บทสรุปการทดสอบ (Final Verdict)
                    </h4>
                    <p className="text-sm text-green-800/80 mt-1 leading-relaxed">
                      <strong>XGBoost</strong> ให้ค่าความแม่นยำ (Accuracy) และ
                      F1-Score สูงที่สุดที่ <strong>100%</strong>{" "}
                      ในชุดข้อมูลทดสอบ (Test Set) ซึ่งเหนือกว่า Random Forest
                      (99.6%) เล็กน้อย และ Logistic Regression (98.8%)
                      อย่างมีนัยสำคัญในแง่ของการจัดการข้อมูลที่มีความซับซ้อนสูง
                      จึงถูกเลือกเป็น
                      <strong> Champion Model</strong> สำหรับระบบ Production
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
