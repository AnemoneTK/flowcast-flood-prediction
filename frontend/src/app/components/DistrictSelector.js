"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, Plus, ChevronDown } from "lucide-react";

export default function DistrictSelector({
  districts = [],
  selected = [],
  onSelect,
  onRemove,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Filter เขต
  const filteredDistricts = districts.filter((d) => {
    const name = d.dname || ""; // กัน null
    return name.includes(search) && !selected.some((s) => s.dcode === d.dcode);
  });

  return (
    <div className="w-full relative z-[100]" ref={wrapperRef}>
      {/* Search Input Box */}
      <div
        className="flex items-center flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Search className="text-slate-400 ml-1" size={18} />

        {/* Tags ของเขตที่เลือกแล้ว */}
        {selected.map((d) => (
          <span
            key={d.dcode}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1"
          >
            {d.dname}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(d);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}

        {/* ช่องกรอกข้อมูล */}
        <input
          type="text"
          className="flex-1 outline-none bg-transparent min-w-[120px] text-slate-700 placeholder:text-slate-400 h-8 text-sm"
          placeholder={
            selected.length === 0
              ? "ค้นหาเขต... (พิมพ์ชื่อได้เลย)"
              : selected.length < 3
              ? "พิมพ์เพิ่ม..."
              : ""
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={selected.length >= 3}
        />

        <ChevronDown size={16} className="text-slate-300 mr-2" />
      </div>

      {/* Dropdown List */}
      {isOpen && selected.length < 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto z-[9999]">
          {filteredDistricts.length > 0 ? (
            filteredDistricts.map((d) => (
              <button
                key={d.dcode}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-slate-700 flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
                onClick={() => {
                  onSelect(d);
                  setSearch("");
                  setIsOpen(false); // เลือกเสร็จปิดเลย
                }}
              >
                <span className="font-medium">{d.dname}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                  <Plus size={12} /> เลือก
                </span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-slate-400 text-sm">
              {districts.length === 0
                ? "กำลังโหลดข้อมูล..."
                : "ไม่พบเขตที่ค้นหา"}
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="text-right mt-1">
        <span className="text-[10px] text-slate-400">
          {selected.length}/3 เขตที่เลือก
        </span>
      </div>
    </div>
  );
}
