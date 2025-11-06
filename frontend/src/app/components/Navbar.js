// frontend/src/app/components/Navbar.js

// (สำคัญ!) ต้องเป็น Client Component เพื่อใช้ State
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Import ไอคอนจาก library ที่เราติดตั้งไป

export default function Navbar() {
  // สร้าง State เพื่อเช็คว่าเมนูมือถือเปิดอยู่หรือไม่
  const [isOpen, setIsOpen] = useState(false);

  return (
    // เปลี่ยนเป็นพื้นหลังสีขาว, เพิ่มเงา (shadow)
    // `relative` เพื่อให้เมนู dropdown มันยึดติดกับ Navbar
    <nav className="bg-white text-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* 1. Logo (ทำตัวใหญ่ขึ้นและใช้สีน้ำเงิน) */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600"
          onClick={() => setIsOpen(false)} // กดโลโก้ ให้ปิดเมนู
        >
          FlowCast BKK
        </Link>

        {/* 2. Desktop Menu (ซ่อนในจอมือถือ) */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            href="/model"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Model
          </Link>
          <Link
            href="/data"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Data
          </Link>
          {/* ทำให้ปุ่ม Dashboard เด่นขึ้นมา */}
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow hover:shadow-lg"
          >
            Dashboard
          </Link>
        </div>

        {/* 3. Mobile Hamburger Button (แสดงเฉพาะในจอมือถือ) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)} // กดเพื่อสลับค่า true/false
            className="text-gray-900"
            aria-label="Toggle menu"
          >
            {/* ถ้าเมนูเปิด ให้แสดง X, ถ้าปิด ให้แสดง Menu */}
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu Dropdown (แสดง/ซ่อน ตามค่า `isOpen`) */}
      <div
        className={`md:hidden absolute w-full bg-white shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <Link
          href="/model"
          className="block px-5 py-3 text-lg text-gray-700 hover:bg-gray-100"
          onClick={() => setIsOpen(false)} // กดแล้วปิดเมนู
        >
          Model
        </Link>
        <Link
          href="/data"
          className="block px-5 py-3 text-lg text-gray-700 hover:bg-gray-100"
          onClick={() => setIsOpen(false)} // กดแล้วปิดเมนู
        >
          Data
        </Link>
        <Link
          href="/dashboard"
          className="block px-5 py-3 text-lg text-gray-700 hover:bg-gray-100"
          onClick={() => setIsOpen(false)} // กดแล้วปิดเมนู
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
