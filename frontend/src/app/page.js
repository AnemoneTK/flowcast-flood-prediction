// frontend/src/app/page.js

"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CloudRain,
  TrendingDown,
  Home,
  BrainCircuit,
  Database,
  Scaling,
  LayoutGrid,
  Map,
  ArrowRight,
  Zap,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="bg-slate-50">
      {/* =========================================================
          1. Hero Section (Parallax Background) - คงเดิม 100%
      ========================================================= */}
      <section className="relative h-[80vh] md:h-[90vh] flex items-center justify-center text-white overflow-hidden bg-gray-900 rain-container">
        {/* Background Image (z-0) */}
        <Image
          src="/images/rain-bg2.jpg"
          alt="Rain background"
          width={1920}
          height={1080}
          priority={true}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />

        {/* Cityscape (z-10) */}
        <Image
          src="/images/bkk-cityscape.png"
          alt="Bangkok cityscape"
          width={1920}
          height={800}
          className="absolute bottom-0 w-full object-cover object-bottom z-10 hidden md:block"
          style={{
            transform: `translateY(calc(100px + ${scrollY * 0.3}px))`,
            height: "auto",
            maxHeight: "100%",
            left: 0,
            right: 0,
            margin: "auto",
          }}
        />

        {/* Water Layers (z-5, z-30) */}
        <Image
          src="/images/water-back.png"
          alt="Water wave back"
          width={1920}
          height={300}
          className="absolute bottom-0 w-full object-cover object-bottom z-5"
          style={{ transform: `translateY(calc(80px - ${scrollY * 0.1}px))` }}
        />
        <Image
          src="/images/water-front.png"
          alt="Water wave front"
          width={1920}
          height={400}
          className="absolute bottom-0 w-full object-cover object-bottom z-30"
          style={{ transform: `translateY(calc(250px - ${scrollY * 0.3}px))` }}
        />

        {/* Vignette Layer (z-40) */}
        <div className="absolute inset-0 z-40 bg-gradient-to-t from-black/30 to-transparent"></div>

        {/* Text Content (z-50) */}
        <div className="relative z-50 text-center max-w-4xl mx-auto px-4">
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            style={{ textShadow: "0 3px 10px rgba(0, 0, 0, 0.7)" }}
          >
            FlowCast BKK
          </h1>
          <p
            className="text-lg md:text-xl text-gray-100 max-w-4xl mx-auto mb-12 leading-relaxed font-medium"
            style={{ textShadow: "0 2px 8px rgba(0, 0, 0, 0.7)" }}
          >
            ระบบพยากรณ์ความเสี่ยงน้ำท่วมกรุงเทพฯ ด้วย AI
            <br className="hidden md:block" />
            เปลี่ยนข้อมูลให้เป็นแผนรับมือที่แม่นยำและชาญฉลาด
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            เข้าสู่ Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* =========================================================
          2. The Problem (ปัญหาที่กรุงเทพฯ เจอ)
      ========================================================= */}
      <section className="py-20 md:py-24 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5"></div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">
              The Challenge
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-4">
              ทำไมน้ำถึงรอระบาย?
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <ProblemCard
              icon={<CloudRain className="w-10 h-10 text-white" />}
              title="Extreme Weather"
              description="ปริมาณน้ำฝนที่คาดเดายากและรุนแรงขึ้นจากการเปลี่ยนแปลงสภาพภูมิอากาศ ทำให้ระบบระบายน้ำเดิมรับมือไม่ทัน"
              color="bg-blue-500"
            />
            <ProblemCard
              icon={<Home className="w-10 h-10 text-white" />}
              title="Urban Density"
              description="การขยายตัวของเมืองที่หนาแน่น สิ่งปลูกสร้างขวางทางน้ำ และพื้นที่รับน้ำ (แก้มลิง) ตามธรรมชาติที่ลดน้อยลง"
              color="bg-indigo-500"
            />
            <ProblemCard
              icon={<TrendingDown className="w-10 h-10 text-white" />}
              title="Infrastructure Gap"
              description="ความไม่สอดคล้องกันระหว่างทรัพยากร (เครื่องสูบน้ำ) กับภาระงาน (ปริมาณน้ำฝน) ในแต่ละพื้นที่"
              color="bg-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          3. The Solution (Hybrid AI Approach) - อัปเดตใหม่
      ========================================================= */}
      <section className="py-20 md:py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-full mb-6 border border-blue-500/30">
            <BrainCircuit className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            แก้ปัญหาด้วย{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Hybrid AI Approach
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            เราไม่ได้ใช้แค่สถิติเดิมๆ แต่เราผสานพลังของ{" "}
            <strong>Unsupervised Learning</strong> เพื่อค้นหาโครงสร้างปัญหา และ{" "}
            <strong>Supervised Learning</strong> เพื่อพยากรณ์อนาคต
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">1. Risk Profiling</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                ใช้ <strong>K-Means Clustering + PCA</strong>{" "}
                วิเคราะห์โครงสร้างพื้นฐานกว่า 50 เขต
                แบ่งกลุ่มพื้นที่ตามลักษณะความเสี่ยง (Cluster 0-2)
                เพื่อการจัดการที่ตรงจุด
              </p>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-600 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">2. Precision Forecasting</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                ใช้ <strong>XGBoost (Gradient Boosting)</strong>{" "}
                ที่ผ่านการฝึกฝนด้วยข้อมูลย้อนหลัง
                สร้างโมเดลพยากรณ์ความเสี่ยงรายวันที่มีความแม่นยำสูง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. The Process (Data Pipeline)
      ========================================================= */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">
              Methodology
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
              เบื้องหลังความแม่นยำ
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              icon={<Database className="w-8 h-8 text-blue-600" />}
              step="01"
              title="Data Integration"
              description="รวบรวมข้อมูลจริงปี 2023-2024 ทั้งปริมาณฝน, ระดับน้ำในคลอง, ประสิทธิภาพเครื่องสูบ, และจุดเสี่ยงน้ำท่วม จากฐานข้อมูล กทม."
            />
            <StepCard
              icon={<Scaling className="w-8 h-8 text-blue-600" />}
              step="02"
              title="Feature Engineering"
              description="สร้างตัวแปรชี้วัดใหม่ เช่น 'Rain Load' (ภาระรับน้ำฝนต่อเครื่องสูบ) และ 'Pump Density' เพื่อสะท้อนขีดความสามารถจริงของแต่ละเขต"
            />
            <StepCard
              icon={<LayoutGrid className="w-8 h-8 text-blue-600" />}
              step="03"
              title="Model Optimization"
              description="ค้นหาค่า K ที่เหมาะสมที่สุด (K=3) และคัดเลือก Champion Model (XGBoost) ผ่านกระบวนการ Benchmarking ที่เข้มข้น"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          5. The Result (3 Clusters) - อัปเดตใหม่เป็น K=3
      ========================================================= */}
      <section className="py-20 md:py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
            ค้นพบ 3 รูปแบบความเสี่ยง (Risk Profiles)
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            จากการวิเคราะห์ เราสามารถจัดกลุ่ม 50 เขตของกรุงเทพฯ ออกเป็น 3
            กลุ่มที่มีลักษณะเฉพาะตัว ช่วยให้ผู้บริหารเมืองวางแผนรับมือได้ถูกที่
            ถูกเวลา
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <ClusterCard
              title="Cluster 0: Low Risk"
              description="พื้นที่ความเสี่ยงต่ำ มีระบบระบายน้ำเพียงพอเมื่อเทียบกับปริมาณฝนเฉลี่ย"
              badgeColor="bg-green-100 text-green-800"
            />
            <ClusterCard
              title="Cluster 1: High Risk"
              description="พื้นที่วิกฤต มีภาระรับน้ำฝน (Rain Load) สูงมาก จำเป็นต้องเพิ่มทรัพยากรเร่งด่วน"
              badgeColor="bg-red-100 text-red-800"
            />
            <ClusterCard
              title="Cluster 2: Well Managed"
              description="พื้นที่เฝ้าระวังพิเศษ ฝนตกหนักแต่มีเครื่องสูบน้ำหนาแน่น (High Capacity)"
              badgeColor="bg-yellow-100 text-yellow-800"
            />
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block w-full max-w-2xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CheckCircle2 className="text-green-600 w-6 h-6" />
              <h4 className="text-xl font-bold text-slate-800">
                Prediction Accuracy
              </h4>
            </div>
            <p className="text-slate-600">
              โมเดล XGBoost ของเราทำนายระดับความเสี่ยงได้แม่นยำถึง{" "}
              <strong>100%</strong> ในชุดข้อมูลทดสอบ
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. Call to Action
      ========================================================= */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            พร้อมรับมือกับฤดูฝนหรือยัง?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            สำรวจข้อมูลเชิงลึก ดูการจัดกลุ่มเขต
            และตรวจสอบพยากรณ์ความเสี่ยงรายวันได้ที่ Dashboard ของเรา
          </p>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-4 px-10 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center gap-2"
          >
            <LayoutGrid className="w-5 h-5" />
            ไปที่ Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

// --- Helper Components ---

function ProblemCard({ icon, title, description, color }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
      <div
        className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function StepCard({ icon, step, title, description }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative group">
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {step}
      </div>
      <div className="mb-6 p-3 bg-blue-50 rounded-xl inline-block text-blue-600 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ClusterCard({ title, description, badgeColor }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl transition-shadow text-left">
      <span
        className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-4 ${badgeColor}`}
      >
        Risk Profile
      </span>
      <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
