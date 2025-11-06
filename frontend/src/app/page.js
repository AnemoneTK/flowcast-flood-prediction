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
    <div>
      {/* 1. Hero Section (พร้อม Parallax Background) */}
      <section
        className="relative h-[80vh] md:h-[90vh] flex items-center justify-center text-white overflow-hidden bg-gray-900 rain-container"
        /* 'rain-container' นี้ถูกต้องแล้วสำหรับ globals.css */
      >
        {/* --- *** ผมเพิ่มบรรทัดนี้กลับเข้ามาครับ *** --- */}
        {/* --- Background Image (z-0) --- */}
        <Image
          src="/images/rain-bg2.jpg" // (ภาพพื้นหลังที่หายไป)
          alt="Rain background"
          width={1920}
          height={1080}
          priority={true}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        {/* --- (โค้ดที่เหลือของคุณ ถูกต้องทั้งหมด) --- */}

        <Image
          src="/images/bkk-cityscape.png" // (z-10)
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
        {/* <Image
          src="/images/water-back.png" // (z-20)
          alt="Water wave back"
          width={1920}
          height={300}
          className="absolute bottom-0 w-full object-cover object-bottom z-20"
          style={{ transform: `translateY(calc(100px + ${scrollY * 0.1}px))` }}
        /> */}
        <Image
          src="/images/water-back.png" // (z-20)
          alt="Water wave back"
          width={1920}
          height={300}
          className="absolute bottom-0 w-full object-cover object-bottom z-5"
          style={{ transform: `translateY(calc(80px - ${scrollY * 0.1}px))` }}
        />
        <Image
          src="/images/water-front.png" // (z-30)
          alt="Water wave front"
          width={1920}
          height={400}
          className="absolute bottom-0 w-full object-cover object-bottom z-30"
          style={{ transform: `translateY(calc(250px - ${scrollY * 0.3}px))` }}
        />

        {/* --- Vignette Layer (z-40) --- */}
        <div className="absolute inset-0 z-40 bg-gradient-to-t from-black/30 to-transparent"></div>

        {/* --- Text Content (z-50) --- */}
        <div className="relative z-50 text-center max-w-4xl mx-auto px-4">
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            style={{ textShadow: "0 3px 10px rgba(0, 0, 0, 0.7)" }}
          >
            FlowCast BKK
          </h1>
          <p
            className="text-lg md:text-xl text-gray-100 max-w-4xl mx-auto mb-12 leading-relaxed"
            style={{ textShadow: "0 2px 8px rgba(0, 0, 0, 0.7)" }}
          >
            รับมืออุทกภัยกรุงเทพฯ อย่างตรงจุด
            ด้วยการวิเคราะห์และจัดกลุ่มความเสี่ยงด้วย Machine Learning
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            ไปที่ Interactive Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* 2. The Problem (ปัญหาที่กรุงเทพฯ เจอ) */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              กรุงเทพฯ กับน้ำท่วม: ปัญหาที่รอวันแก้
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <ProblemCard
              icon={<CloudRain className="w-12 h-12 text-blue-600" />}
              title="ฝนตกหนักและคาดเดายาก"
              description="กรุงเทพฯ เผชิญกับปริมาณน้ำฝนที่สูงขึ้นจาก
              การเปลี่ยนแปลงสภาพภูมิอากาศ ทำให้ฝนตกหนักเกินกว่าที่ระบบจะระบายได้ทัน"
            />
            <ProblemCard
              icon={<Home className="w-12 h-12 text-blue-600" />}
              title="ลักษณะพื้นที่ลุ่มต่ำ"
              description="พื้นที่ส่วนใหญ่ของกรุงเทพฯ เป็นที่ลุ่มต่ำ
              บวกกับการทรุดตัวของดิน ทำให้หลายเขตกลายเป็น &ldquo;แอ่งกระทะ&rdquo;
              ที่น้ำไหลมารวมกัน"
            />
            <ProblemCard
              icon={<TrendingDown className="w-12 h-12 text-blue-600" />}
              title="ระบบระบายน้ำที่จำกัด"
              description="แม้จะมีคลองและอุโมงค์ยักษ์
              แต่การขยายตัวของเมืองที่รวดเร็วและขยะอุดตัน
              ทำให้ประสิทธิภาพการระบายน้ำไม่เพียงพอ"
            />
          </div>
        </div>
      </section>

      {/* 3. The Impact (ผลกระทบ) */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ผลกระทบที่มากกว่า &ldquo;น้ำรอระบาย&rdquo;
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
              ปัญหาน้ำท่วมไม่ได้สร้างแค่ความไม่สะดวกสบาย
              แต่มันส่งผลกระทบเป็นวงกว้างต่อชีวิตและเศรษฐกิจ
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              {/* Placeholder image - คุณสามารถเปลี่ยนเป็นรูปภาพจริงได้ */}
              <div className="bg-gray-100 rounded-lg shadow-md w-full h-80 flex items-center justify-center">
                <Map className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            <div className="space-y-6">
              <ImpactItem
                title="การหยุดชะงักทางเศรษฐกิจ"
                description="เส้นทางจราจรเป็นอัมพาต, ธุรกิจร้านค้าต้องปิดตัว,
                เกิดความเสียหายต่อทรัพย์สินและโครงสร้างพื้นฐานมูลค่ามหาศาล"
              />
              <ImpactItem
                title="คุณภาพชีวิตที่ลดลง"
                description="ความเครียดในการเดินทาง, ความเสี่ยงต่อโรคที่มากับน้ำ,
                และภาระค่าใช้จ่ายในการซ่อมแซมบ้านเรือน"
              />
              <ImpactItem
                title="การแก้ปัญหาที่ไม่ตรงจุด"
                description="การจัดสรรงบประมาณและทรัพยากร (เช่น เครื่องสูบน้ำ)
                แบบเหมารวม ทำให้เขตที่วิกฤตจริงๆ อาจไม่ได้รับการช่วยเหลือที่เพียงพอ"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Solution (ไอเดียของเรา) */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <BrainCircuit className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ไอเดียของเรา: ใช้ ML เพื่อการรับมือที่ชาญฉลาด
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            เราเชื่อว่าการแก้ปัญหาแบบ &ldquo;One-size-fits-all&rdquo;
            ใช้ไม่ได้ผลกับปัญหาที่ซับซ้อนนี้
            <br />
            <br />
            เราจึงใช้{" "}
            <strong className="text-gray-900">K-Means Clustering</strong>{" "}
            ซึ่งเป็นโมเดล Unsupervised Machine Learning ในการวิเคราะห์ข้อมูลกว่า
            20 ปัจจัย (เช่น จำนวนคลอง, ปริมาณฝนสูงสุด, ความหนาแน่นประชากร,
            ความพร้อมของปั๊ม) เพื่อ &ldquo;จัดกลุ่ม&rdquo; 50 เขตในกรุงเทพฯ
            ตามลักษณะความเสี่ยงที่แท้จริง
          </p>
        </div>
      </section>

      {/* 5. The Process (เราทำยังไง) */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              จากข้อมูลดิบ สู่ผลลัพธ์
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              icon={<Database className="w-10 h-10 text-blue-600" />}
              step="01"
              title="รวบรวมและเตรียมข้อมูล"
              description="รวบรวมข้อมูลจาก 7 แหล่งที่แตกต่างกัน
              ทั้งข้อมูลคลอง, ฝน, ปั๊ม, จุดเสี่ยง, และข้อมูลประชากร"
            />
            <StepCard
              icon={<Scaling className="w-10 h-10 text-blue-600" />}
              step="02"
              title="Feature Engineering"
              description="สร้างตัวแปรใหม่ที่มีความหมาย
              เช่น &ldquo;ปริมาณฝนสูงสุด&rdquo;, &ldquo;ความหนาแน่นประชากร&rdquo;,
              และ &ldquo;อัตราส่วนความพร้อมปั๊ม&rdquo;"
            />
            <StepCard
              icon={<LayoutGrid className="w-10 h-10 text-blue-600" />}
              step="03"
              title="K-Means Clustering"
              description="ให้โมเดลค้นหาแพทเทิร์นที่ซ่อนอยู่
              และจัดกลุ่มเขตทั้ง 50 เขต ออกเป็น 4 กลุ่ม
              ตามโปรไฟล์ความเสี่ยงที่คล้ายคลึงกัน"
            />
          </div>
        </div>
      </section>

      {/* 6. The Result (สิ่งที่เราเจอ) */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ผลลัพธ์: 4 กลุ่มความเสี่ยงที่แตกต่าง
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            โมเดลของเราแบ่งเขตต่างๆ ออกเป็น 4 กลุ่มหลัก
            ซึ่งช่วยให้เราเข้าใจว่าแต่ละพื้นที่มีจุดแข็ง-จุดอ่อนใด
            และควรได้รับการดูแลแบบไหน
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <ClusterCard title="กลุ่ม 1" description="ชานเมือง/เสี่ยงต่ำ" />
            <ClusterCard title="กลุ่ม 2" description="มรสุมลง/ปั๊มพร้อม" />
            <ClusterCard title="กลุ่ม 0" description="เมืองหนาแน่น" />
            <ClusterCard title="กลุ่ม 3" description="เสี่ยงสูง/น่ากังวล" />
          </div>
        </div>
      </section>

      {/* 7. Call to Action (ส่วนท้าย) */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">สำรวจข้อมูลด้วยตัวคุณเอง</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            เข้าไปดู Dashboard ของเรา เพื่อดูกราฟและแผนที่ Interactive
            ว่าเขตของคุณ... อยู่ในกลุ่มไหน
          </p>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-gray-200 text-blue-600 font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg"
          >
            ไปที่ Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

// --- Helper Components (คอมโพเนนต์ย่อย) ---
// (ส่วนนี้ไม่เปลี่ยนแปลง)
function ProblemCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ImpactItem({ title, description }) {
  return (
    <div>
      <h4 className="text-xl font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ icon, step, title, description }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="flex items-center mb-4">
        {icon}
        <span className="ml-3 text-sm font-bold text-gray-400">
          STEP {step}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ClusterCard({ title, description }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
      <h4 className="text-lg font-bold text-blue-600">{title}</h4>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}
