// frontend/src/app/data/page.js
"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  FileText,
  Map,
  Server,
  Droplet,
  Wind,
  ShieldAlert,
  Share2,
  Activity,
  AlertTriangle,
  Table,
  Calculator,
  GitMerge,
  Minimize2,
  Layers,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// --- Component: การ์ดแหล่งข้อมูล ---
const DataSourceCard = ({ title, format, source, icon: Icon, url }) => (
  <div className="group bg-slate-50/50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 h-full">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-md uppercase tracking-wider">
        {format}
      </div>
    </div>

    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
      {title}
    </h3>

    <p className="text-sm text-slate-500">
      <span className="font-semibold text-slate-400 mr-1">Source:</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline hover:text-blue-600 truncate inline-block max-w-full align-bottom"
        >
          {source}
        </a>
      ) : (
        <span className="text-slate-600">{source}</span>
      )}
    </p>
  </div>
);

// --- Component: อธิบาย Feature Engineering ---
const FeatureCard = ({
  title,
  formula,
  description,
  example,
  icon: Icon,
  colorClass,
  borderClass,
}) => (
  <div
    className={`relative bg-white p-6 rounded-2xl border-l-[6px] ${borderClass} shadow-sm border-y border-r border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group`}
  >
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Icon */}
      <div className={`p-3.5 rounded-2xl ${colorClass} shadow-inner shrink-0`}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
            {title}
          </h4>
          {formula && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100/80 text-slate-500 text-xs font-mono border border-slate-200/60">
              <Calculator className="w-3 h-3 mr-1.5 opacity-50" />
              {formula}
            </span>
          )}
        </div>

        <p className="text-base text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Example Box */}
      {example && (
        <div className="w-full md:w-[45%] bg-slate-50/80 p-5 rounded-xl border border-slate-200/60 flex flex-col justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Example Scenario
            </span>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-sm text-slate-500">
              <div className="min-w-[40px] font-medium pt-0.5">Raw:</div>
              <div className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-100 w-full shadow-sm">
                {example.before}
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm font-medium">
              <div className="min-w-[40px] pt-0.5 text-green-600 font-bold">
                Eng:
              </div>
              <div className="font-mono bg-green-50/50 px-2 py-0.5 rounded border border-green-100 text-green-700 w-full shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {example.after}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// --- Component: ตารางข้อมูล ---
const DataComparisonTables = () => {
  const [activeTab, setActiveTab] = useState("raw");
  const [rawData, setRawData] = useState([]);
  const [engineeredData, setEngineeredData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rawRes, engRes] = await Promise.all([
          fetch("/api/data/raw"),
          fetch("/api/data/engineered"),
        ]);
        const raw = await rawRes.json();
        const engJson = await engRes.json();

        // --- กรองข้อมูลเฉพาะปี 2023 ---
        const eng2023 = engJson.filter((item) => item.year === 2023);

        setRawData(raw);
        setEngineeredData(eng2023);
      } catch (error) {
        console.error("Error fetching table data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Fetching datasets...</p>
      </div>
    );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Custom Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab("raw")}
          className={`flex-1 py-5 text-sm font-bold tracking-wide transition-all relative ${
            activeTab === "raw"
              ? "text-blue-600 bg-blue-50/30"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          1. Raw Data (ข้อมูลดิบ)
          {activeTab === "raw" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("engineered")}
          className={`flex-1 py-5 text-sm font-bold tracking-wide transition-all relative ${
            activeTab === "engineered"
              ? "text-green-600 bg-green-50/30"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          2. Engineered Data (ข้อมูลที่วิเคราะห์แล้ว)
          {activeTab === "engineered" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
          )}
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
        {activeTab === "raw" ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 font-bold uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-8 py-4">รหัส</th>
                <th className="px-6 py-4">เขต</th>
                <th className="px-6 py-4 text-right">พื้นที่ (ตร.กม.)</th>
                <th className="px-6 py-4 text-right">ประชากร</th>
                <th className="px-6 py-4 text-right">จำนวนคลอง</th>
                <th className="px-6 py-4 text-right">เครื่องสูบน้ำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rawData.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-4 font-mono text-slate-400 font-medium">
                    {row.dcode}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {row.dname}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {(row.area / 1000000).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {row.population.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {row.canal_count}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {row.pump_number}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 font-bold uppercase bg-green-50/40 sticky top-0 shadow-sm z-10">
              <tr>
                {/* ลบคอลัมน์ปีออก */}
                <th className="px-8 py-4">เขต</th>
                <th className="px-6 py-4 text-right text-green-700">
                  Rain Load
                </th>
                <th className="px-6 py-4 text-right text-green-700">
                  Pump Density
                </th>
                <th className="px-6 py-4 text-right text-purple-700">PC1</th>
                <th className="px-6 py-4 text-right text-purple-700">PC2</th>
                <th className="px-6 py-4 text-center">Cluster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {engineeredData.map((row, i) => (
                <tr key={i} className="hover:bg-green-50/30 transition-colors">
                  {/* ลบข้อมูลปีออก */}
                  <td className="px-8 py-4 font-semibold text-slate-700">
                    {row.dname}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">
                    {row.rain_load?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">
                    {row.pump_density?.toExponential(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-purple-600 bg-purple-50/30">
                    {row.pc1?.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-purple-600 bg-purple-50/30">
                    {row.pc2?.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                        row.cluster === 0
                          ? "bg-yellow-100  text-green-700 border-green-200"
                          : row.cluster === 1
                          ? "bg-green-100 text-red-700 border-red-200"
                          : row.cluster === 2
                          ? "bg-red-100  text-yellow-700  border-yellow-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {row.cluster}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// --- Main Page ---
export default function DataPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 space-y-20">
        {/* --- HEADER --- */}
        <section className="text-center space-y-6 py-10 relative">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Data Pipeline
            </span>{" "}
            & Methodology
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            จากข้อมูลดิบภาครัฐ สู่การสังเคราะห์ตัวแปร (Feature Engineering)
            เพื่อสร้างโมเดลพยากรณ์ความเสี่ยงน้ำท่วมที่มีความแม่นยำสูงสุด
          </p>
        </section>

        {/* --- PART 1: Raw Data --- */}
        <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

          <div className="flex items-center gap-5 mb-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-3xl shadow-lg shadow-blue-200">
              1
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Raw Data Sources
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                ฐานข้อมูลตั้งต้นจากหน่วยงานกรุงเทพมหานคร
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataSourceCard
              title="ขอบเขต 50 เขต"
              format="Shapefile"
              source="data.bangkok.go.th"
              icon={Map}
            />
            <DataSourceCard
              title="จุดอ่อนน้ำท่วม"
              format="Shapefile"
              source="data.bangkok.go.th"
              icon={Droplet}
            />
            <DataSourceCard
              title="ข้อมูลคลอง"
              format="Excel Report"
              source="dds.bangkok.go.th"
              icon={FileText}
            />
            <DataSourceCard
              title="ปริมาณน้ำฝน"
              format="API (JSON)"
              source="BMA Rainfall API"
              icon={Activity}
            />
            <DataSourceCard
              title="สถานีสูบน้ำ"
              format="Shapefile"
              source="data.bangkok.go.th"
              icon={Wind}
            />
            <DataSourceCard
              title="ประตูระบายน้ำ"
              format="Shapefile"
              source="data.bangkok.go.th"
              icon={ShieldAlert}
            />
            <DataSourceCard
              title="สถิติความเสี่ยง"
              format="PDF (OCR)"
              source="รายงานสรุปเหตุการณ์ฯ"
              icon={AlertTriangle}
            />
            <DataSourceCard
              title="ความพร้อมเครื่องสูบ"
              format="CSV"
              source="data.bangkok.go.th"
              icon={Server}
            />
          </div>
        </section>

        {/* --- PART 2: Feature Engineering --- */}
        <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-50/60 rounded-full blur-3xl -z-10 -translate-x-1/3 -translate-y-1/3"></div>

          <div className="flex items-center gap-5 mb-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 text-white font-bold text-3xl shadow-lg shadow-purple-200">
              2
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Feature Engineering
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                กระบวนการสร้างตัวแปรใหม่เพื่อเพิ่มประสิทธิภาพโมเดล
              </p>
            </div>
          </div>

          {/* Domain Features Group */}
          <div className="space-y-8 mb-12">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-700">
              <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
              Domain Knowledge Features (ตัวแปรเชิงโครงสร้าง)
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <FeatureCard
                title="Rain Load (ภาระรับน้ำฝน)"
                formula="ปริมาณฝนรวม / จำนวนเครื่องสูบน้ำ"
                description="ตัวชี้วัดสำคัญที่บอกว่าเครื่องสูบน้ำ 1 เครื่องในเขตนั้น ต้องรับภาระระบายน้ำฝนเฉลี่ยมากน้อยเพียงใด หากค่านี้สูงแสดงว่ามีความเสี่ยงสูงที่เครื่องสูบจะทำงานไม่ทันเมื่อฝนตกหนัก"
                example={{
                  before: "ฝน 100 มม., ปั๊ม 5 เครื่อง",
                  after: "Load = 20 (ภาระต่อเครื่อง)",
                }}
                icon={Droplet}
                colorClass="bg-blue-100 text-blue-600"
                borderClass="border-blue-500"
              />

              <FeatureCard
                title="Pump Density (ความหนาแน่นเครื่องสูบ)"
                formula="จำนวนเครื่องสูบ / พื้นที่เขต (ตร.กม.)"
                description="บ่งบอกความครอบคลุมของระบบระบายน้ำในพื้นที่ ช่วยลดอคติ (Bias) ระหว่างเขตที่มีขนาดใหญ่และเขตขนาดเล็ก ทำให้เปรียบเทียบความสามารถในการระบายน้ำได้ยุติธรรมขึ้น"
                example={{
                  before: "ปั๊ม 10 เครื่อง, พื้นที่ 50 ตร.กม.",
                  after: "0.2 เครื่อง/ตร.กม.",
                }}
                icon={Wind}
                colorClass="bg-cyan-100 text-cyan-600"
                borderClass="border-cyan-500"
              />

              <FeatureCard
                title="Retention Capacity (ขีดความสามารถการกักเก็บ)"
                formula="จำนวนคลอง + จำนวนประตูระบายน้ำ"
                description="ตัวแทนของพื้นที่รองรับน้ำ (แก้มลิงหรือคลอง) ก่อนที่จะถูกระบายออกสู่แม่น้ำ การมีค่านี้สูงช่วยชะลอน้ำท่วมขังรอการระบายได้ดีกว่า"
                example={{
                  before: "คลอง 20 สาย, ประตูน้ำ 5 แห่ง",
                  after: "Capacity = 25 (จุดพักน้ำ)",
                }}
                icon={Layers}
                colorClass="bg-indigo-100 text-indigo-600"
                borderClass="border-indigo-500"
              />

              <FeatureCard
                title="Population Density (ความหนาแน่นประชากร)"
                formula="จำนวนประชากร / พื้นที่เขต"
                description="ใช้ประเมินระดับผลกระทบ (Impact Factor) หากเกิดน้ำท่วม พื้นที่ที่มีความหนาแน่นประชากรสูงย่อมมีความเสี่ยงด้านเศรษฐกิจและสังคมสูงกว่าพื้นที่เบาบาง"
                example={{
                  before: "คน 50,000, พื้นที่ 10 ตร.กม.",
                  after: "5,000 คน/ตร.กม.",
                }}
                icon={Users}
                colorClass="bg-orange-100 text-orange-600"
                borderClass="border-orange-500"
              />
            </div>
          </div>

          {/* Math Features Group */}
          <div className="space-y-8">
            <h3 className="flex items-center gap-3 text-xl font-bold text-slate-700">
              <span className="w-1.5 h-8 bg-purple-500 rounded-full"></span>
              Mathematics & Machine Learning Features
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <FeatureCard
                title="PCA (Principal Component Analysis)"
                formula="Dimensionality Reduction"
                description="การลดมิติของข้อมูลจากหลายสิบตัวแปร (เช่น สถิติฝนย้อนหลัง, รายละเอียดสิ่งปลูกสร้าง) ให้เหลือเพียงตัวแปรหลัก (PC1, PC2) ที่ยังคงใจความสำคัญไว้ได้ครบถ้วน ช่วยลดสัญญาณรบกวน (Noise) และทำให้โมเดลประมวลผลได้เร็วขึ้น"
                example={{
                  before: "ตัวแปรดิบ 27 ตัว (พื้นที่, ฝน, คลอง...)",
                  after: "2 ตัวแปรหลัก (PC1, PC2)",
                }}
                icon={Minimize2}
                colorClass="bg-purple-100 text-purple-600"
                borderClass="border-purple-500"
              />

              <FeatureCard
                title="Pump Readiness Ratio (อัตราความพร้อม)"
                formula="เครื่องสูบที่ใช้งานได้ / จำนวนทั้งหมด"
                description="ดัชนีชี้วัดประสิทธิภาพเชิงปฏิบัติการ (Operational Health) หากมีเครื่องสูบจำนวนมากแต่เสียบ่อย ก็ยังถือว่ามีความเสี่ยงสูง ค่านี้ช่วยกรองเขตที่มีปัญหาการซ่อมบำรุงออกมา"
                example={{
                  before: "ติดตั้ง 10, ใช้ได้จริง 8",
                  after: "Ratio = 0.8 (พร้อม 80%)",
                }}
                icon={Activity}
                colorClass="bg-green-100 text-green-600"
                borderClass="border-green-500"
              />

              <FeatureCard
                title="Data Normalization (Log Transform)"
                formula="y = log(x + 1)"
                description="การแปลงข้อมูลที่มีความเบ้สูง (Skewed Data) เช่น จำนวนประชากร หรือขนาดพื้นที่ ให้มีการกระจายตัวแบบปกติ (Normal Distribution) เพื่อให้โมเดล Machine Learning เรียนรู้แพทเทิร์นได้แม่นยำยิ่งขึ้น"
                example={{
                  before: "พื้นที่ 50,000,000 ตร.ม.",
                  after: "Log = 17.7 (สเกลเล็กลง)",
                }}
                icon={GitMerge}
                colorClass="bg-gray-100 text-gray-600"
                borderClass="border-gray-400"
              />
            </div>
          </div>
        </section>

        {/* --- PART 3: Comparison Table --- */}
        <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-50/60 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3"></div>

          <div className="flex items-center gap-5 mb-10">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 text-white font-bold text-3xl shadow-lg shadow-green-200">
              3
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Data Transformation Result
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                ตารางเปรียบเทียบข้อมูลจริงก่อนและหลังการประมวลผล
              </p>
            </div>
          </div>

          <DataComparisonTables />
        </section>
      </main>
    </div>
  );
}
