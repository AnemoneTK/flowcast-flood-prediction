"use client";
import { useState, useEffect } from "react";
import {
  ClusterComparison,
  ModelComparisonChart,
  KSelectionChart,
  ClusterProfileTable,
} from "../components/ModelCharts";
import Navbar from "../components/Navbar";

export default function ModelPage() {
  const [clusterData, setClusterData] = useState({ k3: [], k4: [], k6: [] });
  const [modelData, setModelData] = useState([]);
  const [profileData, setProfileData] = useState([]); // State สำหรับตาราง
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/model-info")
      .then((res) => res.json())
      .then((data) => {
        setClusterData(data.clusters);
        setModelData(data.modelMetrics);
        setProfileData(data.clusterProfile); // รับข้อมูล Profile
        console.log("Cluster Profile Data:", data.clusterProfile);
        setLoading(false);
      });
  }, []);

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

          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5 p-2">
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

              <div className="mt-8 p-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl text-center font-bold shadow-md">
                🎯 บทสรุป: เลือก K=3 (High / Medium / Low Risk)
              </div>
            </div>
            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
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

                {/* ✅ ใส่ตารางตรงนี้ */}
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

        {/* --- PART 2: Supervised Learning (ปรับเป็น White Theme ⚪️) --- */}
        <section className="scroll-mt-20 relative overflow-hidden bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          {/* Background Effects แบบคลีนๆ */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

          <div className="flex items-center gap-5 mb-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-600 text-white font-bold text-3xl shadow-lg shadow-purple-200">
              3
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-800">
                Model Benchmarking
              </h2>
              <p className="text-slate-500 text-lg font-medium mt-1">
                การทดสอบประสิทธิภาพ (Stress Test) เพื่อหา Champion Model
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Panel: Model Cards & Info */}
            <div className="lg:col-span-4 space-y-6">
              {/* Info Box */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-700">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-purple-700">
                  <span className="text-2xl">🥊</span> การประลองโมเดล
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  เรานำโมเดล 3 ประเภทมาทดสอบกับข้อมูลจำลองสถานการณ์น้ำท่วม
                  (Synthetic Data) เพื่อวัดความแม่นยำในสภาวะวิกฤต
                </p>
              </div>

              {/* Cards */}
              <div className="space-y-4">
                {/* XGBoost (Winner) - เด่นแต่ยังคุมโทน */}
                <div className="group bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-3xl shadow-lg transform transition-all hover:scale-105 relative overflow-hidden text-white">
                  <div className="absolute top-3 right-3 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    🏆 CHAMPION
                  </div>
                  <h3 className="font-bold text-2xl mb-1 text-white">
                    XGBoost
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 font-medium">
                    Gradient Boosting Machine
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-extrabold text-yellow-400 leading-none">
                      100%
                    </span>
                    <span className="text-slate-300 font-bold mb-1">
                      Accuracy
                    </span>
                  </div>
                </div>

                {/* Random Forest */}
                <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-xl text-slate-700 mb-1">
                    Random Forest
                  </h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-blue-600 leading-none">
                      99.6%
                    </span>
                    <span className="text-slate-400 text-sm font-medium mb-1">
                      Accuracy
                    </span>
                  </div>
                </div>

                {/* Logistic Regression */}
                <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-xl text-slate-700 mb-1">
                    Logistic Regression
                  </h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-green-600 leading-none">
                      98.8%
                    </span>
                    <span className="text-slate-400 text-sm font-medium mb-1">
                      Accuracy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Chart (ขยายใหญ่) */}
            <div className="lg:col-span-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl relative">
              {/* <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div> */}
              <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <span className="w-3 h-8 bg-purple-600 rounded-full"></span>
                Performance Comparison Chart
              </h3>
              <div className="w-full h-[550px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-slate-300 animate-pulse font-medium">
                    Loading Chart...
                  </div>
                ) : (
                  <ModelComparisonChart data={modelData} />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
