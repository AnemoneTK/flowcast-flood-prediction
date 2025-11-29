// src/app/components/DistrictSelector.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, MapPin, Loader2 } from "lucide-react";

export default function DistrictSelector({ onSelect }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const wrapperRef = useRef(null);

  // 1. Fetch ข้อมูล (ดึงรายชื่อเขต)
  useEffect(() => {
    async function fetchDistricts() {
      try {
        // เรียก API เฉพาะส่วน list
        const res = await fetch("/api/dashboard-analytics?mode=list");
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        // Debug: ดูว่าได้ข้อมูลมาไหม
        // console.log("Fetched Districts:", data);

        // รองรับทั้ง Array ตรงๆ และ { data: [...] }
        if (Array.isArray(data)) {
          setDistricts(data);
        } else if (data.data && Array.isArray(data.data)) {
          setDistricts(data.data);
        } else {
          setDistricts([]);
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

  // 2. ปิดเมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // 3. กรองข้อมูล (Autocomplete Logic)
  // ต้องเช็ค districts เป็น array ก่อนเสมอ
  const filteredDistricts = Array.isArray(districts)
    ? districts.filter(
        (d) =>
          d.dname && d.dname.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const handleSelect = (district) => {
    if (!district) return;
    setSelected(district);
    setSearch(district.dname);
    setIsOpen(false);
    if (onSelect) onSelect(district.dcode);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (filteredDistricts.length > 0) {
        handleSelect(filteredDistricts[0]);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelected(null);
    setSearch("");
    setIsOpen(false);
    if (onSelect) onSelect(null);
  };

  return (
    <div className="w-full relative z-[50]" ref={wrapperRef}>
      <div
        className={`flex items-center bg-white border rounded-xl px-4 py-3 shadow-sm transition-all cursor-text
          ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-blue-300"
          }`}
        onClick={() => {
          setIsOpen(true);
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
          placeholder={loading ? "กำลังโหลด..." : "ค้นหาเขต..."}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (selected && e.target.value !== selected.dname)
              setSelected(null);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

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

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-xl max-h-[280px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 custom-scrollbar z-[100]">
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
              ไม่พบข้อมูล {"{search}"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
