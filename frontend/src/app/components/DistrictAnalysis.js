// src/app/components/DistrictAnalysis.js
"use client";
import { useState, useEffect } from "react";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsiveBar } from "@nivo/bar";

export default function DistrictAnalysis({ dcode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // โหลดข้อมูลเสมอ ไม่ว่าจะมี dcode หรือไม่ (ถ้าไม่มี API จะส่งภาพรวมมาให้)
    const fetchData = async () => {
      setLoading(true);
      try {
        // ถ้า dcode เป็น null ให้ส่งค่าว่างไป หรือส่ง string 'null'
        const query = dcode ? `?dcode=${dcode}` : "";
        const res = await fetch(`/api/analytics/district-diagnosis${query}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [dcode]);

  if (loading)
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed">
        <span className="text-blue-500 animate-pulse">
          กำลังโหลดข้อมูลวิเคราะห์...
        </span>
      </div>
    );

  if (!data) return null;

  const { district, radarData } = data;
  const isOverview = district.cluster === -1; // เช็คว่าเป็นโหมดภาพรวมไหม

  // สีและข้อความตามสถานะ
  let statusColor = isOverview ? "bg-blue-600" : "bg-gray-600"; // Default
  if (!isOverview) {
    if (district.cluster === 0) statusColor = "bg-green-500";
    if (district.cluster === 1) statusColor = "bg-yellow-500";
    if (district.cluster === 2) statusColor = "bg-red-500";
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div
          className={`absolute top-0 left-0 w-2 h-full ${statusColor}`}
        ></div>
        <div className="flex justify-between items-start pl-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {district.dname}
            </h2>
            <span className="text-sm text-gray-500 mt-1 block">
              {isOverview
                ? "สรุปข้อมูลสถิติทั้ง 50 เขตในความดูแลของ กทม."
                : `Cluster ${district.cluster}: ${
                    district.cluster === 2
                      ? "พื้นที่เสี่ยงสูง (High Risk)"
                      : district.cluster === 1
                      ? "พื้นที่เฝ้าระวัง (Watch)"
                      : "พื้นที่ปลอดภัย (Safe)"
                  }`}
            </span>
          </div>
          {!isOverview && (
            <span
              className={`px-4 py-2 rounded-lg text-white font-bold shadow-sm ${statusColor}`}
            >
              {district.cluster === 2 ? "ความเสี่ยงสูง" : "ปกติ"}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={isOverview ? "จุดเสี่ยงรวมทั้ง กทม." : "จุดเสี่ยงน้ำท่วม"}
          value={district.flood_point_count}
          unit="จุด"
          icon="⚠️"
        />
        <StatCard
          label={isOverview ? "คลองระบายน้ำทั้งหมด" : "จำนวนคลอง"}
          value={district.canal_count}
          unit="สาย"
          icon="🌊"
        />
        <StatCard
          label="เครื่องสูบน้ำติดตั้ง"
          value={district.pump_number}
          unit="เครื่อง"
          icon="⚙️"
        />
        <StatCard
          label="ความพร้อมใช้งาน"
          value={
            district.pump_number
              ? ((district.pump_ready / district.pump_number) * 100).toFixed(1)
              : 0
          }
          unit="%"
          icon="✅"
          isProgress
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <h3 className="font-bold text-gray-700 mb-2">
            {isOverview
              ? "ค่าเฉลี่ยศักยภาพรายเขต"
              : "ศักยภาพเทียบกับค่ามาตรฐาน"}
          </h3>
          <div className="flex-1">
            <ResponsiveRadar
              data={radarData}
              keys={[
                isOverview ? "เฉลี่ยต่อเขต" : district.dname,
                "ค่ามาตรฐาน กทม.",
              ]}
              indexBy="feature"
              maxValue={100}
              margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
              curve="linearClosed"
              borderWidth={2}
              borderColor={{ from: "color" }}
              gridLevels={5}
              gridShape="circular"
              enableDots={true}
              colors={["#3b82f6", "#cbd5e1"]}
              fillOpacity={0.4}
              blendMode="multiply"
              legends={[
                {
                  anchor: "top-left",
                  direction: "column",
                  translateX: -50,
                  translateY: -40,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemTextColor: "#999",
                  symbolSize: 12,
                  symbolShape: "circle",
                },
              ]}
            />
          </div>
        </div>

        {/* Bar Chart: Pump Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <h3 className="font-bold text-gray-700 mb-2">
            สถานะเครื่องสูบน้ำ (Asset Health)
          </h3>
          <div className="flex-1">
            <ResponsiveBar
              data={[
                {
                  status: "พร้อมใช้งาน",
                  value: district.pump_ready,
                  color: "#22c55e",
                },
                {
                  status: "ซ่อม/ไม่พร้อม",
                  value: district.pump_number - district.pump_ready,
                  color: "#ef4444",
                },
              ]}
              keys={["value"]}
              indexBy="status"
              margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
              padding={0.4}
              colors={({ data }) => data.color}
              borderRadius={4}
              axisLeft={{
                legend: "จำนวนเครื่อง",
                legendPosition: "middle",
                legendOffset: -45,
              }}
              labelSkipWidth={12}
              labelTextColor="#fff"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon, isProgress }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl font-bold ${
              isProgress
                ? value > 80
                  ? "text-green-600"
                  : "text-orange-500"
                : "text-gray-800"
            }`}
          >
            {parseInt(value).toLocaleString()}
          </span>
          <span className="text-gray-400 text-sm">{unit}</span>
        </div>
        {isProgress && (
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                value > 80 ? "bg-green-500" : "bg-orange-500"
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
