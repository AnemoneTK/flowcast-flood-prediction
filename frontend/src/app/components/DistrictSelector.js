// src/app/components/DistrictSelector.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, MapPin, Loader2 } from "lucide-react";

export default function DistrictSelector({ onSelect }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(""); // ข้อความที่พิมพ์
  const [selected, setSelected] = useState(null); // Object เขตที่เลือก

  const wrapperRef = useRef(null);

  // 1. Fetch ข้อมูลเมื่อโหลด
  useEffect(() => {
    async function fetchDistricts() {
      try {
        // เรียก API mode=list ที่เราเพิ่งแก้
        const res = await fetch("/api/dashboard-analytics?mode=list");

        if (!res.ok) throw new Error("API Fetch failed");

        const data = await res.json();

        // ตรวจสอบว่าเป็น Array หรือไม่ ถ้าใช่ให้ set เลย
        if (Array.isArray(data)) {
          setDistricts(data);
        } else if (data.districts && Array.isArray(data.districts)) {
          // เผื่อกรณี API ส่งกลับมาเป็น { districts: [...] }
          setDistricts(data.districts);
        } else {
          setDistricts([]); // กันตาย
        }
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDistricts();
  }, []);

  // 2. คลิกข้างนอกเพื่อปิด
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // 3. กรองข้อมูล (Autocomplete)
  const filteredDistricts = Array.isArray(districts)
    ? districts.filter((d) => d.dname && d.dname.includes(search))
    : [];

  // User เลือกเขตจาก List
  const handleSelect = (district) => {
    setSelected(district);
    setSearch(district.dname); // เอาชื่อไปแปะในช่อง Input
    setIsOpen(false);
    if (onSelect) onSelect(district.dcode); // ส่งรหัสเขตไปบอกหน้าแม่
  };

  // User กดปุ่ม X (เคลียร์ค่า)
  const handleClear = (e) => {
    e.stopPropagation();
    setSelected(null);
    setSearch("");
    setIsOpen(false);
    if (onSelect) onSelect(null); // บอกหน้าแม่ว่าไม่เลือกแล้ว
  };

  return (
    <div className="w-full relative z-[50]" ref={wrapperRef}>
      {/* Input Area */}
      <div
        className={`flex items-center bg-white border rounded-xl px-4 py-3 shadow-sm transition-all cursor-text
          ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-blue-300"
          }`}
        onClick={() => {
          setIsOpen(true);
          // ถ้ามีเลือกอยู่แล้ว แล้วมาคลิก -> ให้เคลียร์ text เพื่อพิมพ์ใหม่ได้ง่ายๆ (Optional UX)
          if (selected && search === selected.dname) setSearch("");
        }}
      >
        <Search
          className={`mr-3 ${selected ? "text-blue-600" : "text-slate-400"}`}
          size={20}
        />

        <input
          type="text"
          className="flex-1 outline-none bg-transparent text-slate-700 placeholder:text-slate-400 text-base"
          placeholder={loading ? "กำลังโหลด..." : "พิมพ์ชื่อเขต..."}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            // ถ้าพิมพ์เปลี่ยนไปจากที่เลือก ให้ถือว่ายกเลิกการเลือกตัวเก่า
            if (selected && e.target.value !== selected.dname)
              setSelected(null);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={loading}
        />

        {/* ปุ่ม Clear / ลูกศร */}
        {selected || search ? (
          <button
            onClick={handleClear}
            className="hover:bg-slate-100 p-1 rounded-full transition text-slate-400 hover:text-red-500"
          >
            <X size={16} />
          </button>
        ) : (
          <ChevronDown
            size={20}
            className={`text-slate-300 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl max-h-[280px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
          {loading ? (
            <div className="p-4 text-center text-slate-400 flex justify-center gap-2">
              <Loader2 className="animate-spin" size={16} /> กำลังโหลดข้อมูล...
            </div>
          ) : filteredDistricts.length > 0 ? (
            <ul>
              {filteredDistricts.map((d) => (
                <li
                  key={d.dcode}
                  className={`px-4 py-3 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-none transition-colors
                    ${
                      selected?.dcode === d.dcode
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(d);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      size={16}
                      className={
                        selected?.dcode === d.dcode
                          ? "text-blue-500"
                          : "text-slate-300"
                      }
                    />
                    <span
                      className={`text-sm ${
                        selected?.dcode === d.dcode
                          ? "text-blue-700 font-medium"
                          : "text-slate-700"
                      }`}
                    >
                      {d.dname}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-400 text-sm">
              ไม่พบข้อมูล "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
