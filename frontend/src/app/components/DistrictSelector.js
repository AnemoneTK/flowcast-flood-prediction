// src/app/components/DistrictSelector.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, ChevronDown, Loader2 } from "lucide-react";

export default function DistrictSelector({ onSelect, defaultValue = null }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const wrapperRef = useRef(null);

  // 1. ดึงข้อมูลเขตจาก API เก่าของคุณ (/api/geo/districts)
  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await fetch("/api/geo/districts");
        const json = await res.json();

        // เช็ค format ข้อมูลว่าส่งกลับมาแบบไหน (เผื่อเป็น { data: [...] } หรือ [...])
        const dataList = Array.isArray(json) ? json : json.data || [];
        setDistricts(dataList);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDistricts();
  }, []);

  // 2. ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // 3. Filter การค้นหา
  const filteredDistricts = districts.filter((d) => {
    const name = d.dname || "";
    return name.includes(search);
  });

  const handleSelect = (district) => {
    setSelectedDistrict(district);
    setSearch(""); // เคลียร์คำค้น
    setIsOpen(false);
    onSelect(district.dcode); // ส่ง dcode กลับไปที่ Dashboard
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDistrict(null);
    setSearch("");
    onSelect(null); // ส่งค่า null เพื่อกลับไปดูภาพรวม (Overview)
  };

  return (
    <div className="w-full relative z-[50]" ref={wrapperRef}>
      {/* Input Box */}
      <div
        className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Search className="text-slate-400 mr-3" size={20} />

        {/* แสดงชื่อเขตที่เลือก หรือ ช่องค้นหา */}
        {selectedDistrict ? (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-blue-700 font-bold text-lg flex items-center gap-2">
              <MapPin size={16} /> {selectedDistrict.dname}
            </span>
            <button
              onClick={handleClear}
              className="hover:bg-red-50 hover:text-red-500 rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <input
            type="text"
            className="flex-1 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 text-base"
            placeholder={
              loading
                ? "กำลังโหลดรายชื่อเขต..."
                : "ค้นหาเขต (เช่น จตุจักร, บางรัก)..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={loading}
          />
        )}

        {!selectedDistrict && (
          <ChevronDown
            size={20}
            className={`text-slate-300 ml-2 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && !selectedDistrict && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {loading ? (
            <div className="p-6 flex justify-center text-slate-400">
              <Loader2 className="animate-spin mr-2" /> กำลังโหลด...
            </div>
          ) : filteredDistricts.length > 0 ? (
            filteredDistricts.map((d) => (
              <button
                key={d.dcode}
                className="w-full text-left px-5 py-3 hover:bg-blue-50 text-slate-700 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors group"
                onClick={() => handleSelect(d)}
              >
                <span className="font-medium group-hover:text-blue-600 transition-colors">
                  {d.dname}
                </span>
                {/* ถ้ามีข้อมูลความเสี่ยงในอนาคต สามารถเอามาใส่ตรงนี้ได้ */}
                {/* <span className="text-xs text-slate-400">เลือก</span> */}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-slate-400 text-sm">
              ไม่พบเขตที่ค้นหา "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
