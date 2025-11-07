// frontend/src/app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { csv } from "d3-fetch"; // (แก้) ลบ import กราฟ EDA ออก
import { ResponsiveLine } from "@nivo/line";
import { Map, AlertTriangle, ShieldCheck, Wind, Calendar } from "lucide-react";

// --- Component: KPI Card ---
const KpiCard = ({ title, value, icon: Icon, unit }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">
          {value}{" "}
          <span className="text-lg font-medium text-gray-600">{unit}</span>
        </p>
      </div>
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// --- Component: Chart Box ---
const ChartBox = ({ title, description, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 overflow-x-auto">
      <div className="min-w-[600px] lg:min-w-full">{children}</div>
    </div>
  </div>
);

// --- Component: กราฟเส้นสำหรับฝน ---
const RainfallChart = ({ data }) => (
  <div style={{ height: "400px", width: "100%" }}>
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
      xFormat="time:%Y-%m-%d"
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        format: "%b %d", // แสดงเป็น "เดือน วัน"
        tickValues: "every 7 days", // แสดงทุก 7 วัน
        legend: "วันที่",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        legend: "ปริมาณฝน (มม.)",
        legendOffset: -45,
        legendPosition: "middle",
      }}
      colors={{ scheme: "category10" }}
      pointSize={4}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      enableArea={true}
      areaOpacity={0.1}
      tooltip={({ point }) => (
        <div className="bg-white p-2 rounded shadow border w-48">
          <strong className="text-blue-600">{point.data.xFormatted}</strong>
          <br />
          <span className="text-gray-700">ฝน 24 ชม.: </span>
          <strong className="text-blue-600">{point.data.yFormatted} มม.</strong>
        </div>
      )}
    />
  </div>
);

// --- รายชื่อเดือนสำหรับ Filter ---
const months = [
  { value: "all", name: "ดูทั้งปี" },
  { value: "1", name: "มกราคม" },
  { value: "2", name: "กุมภาพันธ์" },
  { value: "3", name: "มีนาคม" },
  { value: "4", name: "เมษายน" },
  { value: "5", name: "พฤษภาคม" },
  { value: "6", name: "มิถุนายน" },
  { value: "7", name: "กรกฎาคม" },
  { value: "8", name: "สิงหาคม" },
  { value: "9", name: "กันยายน" },
  { value: "10", name: "ตุลาคม" },
  { value: "11", name: "พฤศจิกายน" },
  { value: "12", name: "ธันวาคม" },
];

export default function DashboardPage() {
  const [districtData, setDistrictData] = useState([]); // ข้อมูลเขตทั้งหมด (สำหรับ Dropdown/KPI)
  const [rainChartData, setRainChartData] = useState(null); // ข้อมูลกราฟฝน

  const [isLoading, setIsLoading] = useState(true); // Loading รวม
  const [isLoadingRain, setIsLoadingRain] = useState(true); // Loading เฉพาะกราฟฝน
  const [dataError, setDataError] = useState(null);

  // State สำหรับ Filters
  const [selectedDcode, setSelectedDcode] = useState("1001"); // เริ่มต้นที่ เขตพระนคร
  const [selectedMonth, setSelectedMonth] = useState("1"); // (แก้) เริ่มต้นที่เดือนมกราคม

  // --- Effect 1: โหลดข้อมูล CSV หลัก (สำหรับ KPI และ Dropdown) ---
  useEffect(() => {
    async function loadKpiData() {
      try {
        // (แก้) โหลดไฟล์ clustered "seasonal" (ตัวใหม่)
        const clusterCsvData = await csv(
          "/data/master_features_clustered_seasonal.csv"
        );

        const validDistricts = clusterCsvData
          .filter((d) => d.dcode && d.dname)
          .sort((a, b) => a.dname.localeCompare(b.dname)); // เรียงตามชื่อเขต

        setDistrictData(validDistricts);
      } catch (error) {
        console.error("Failed to load cluster data:", error);
        setDataError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadKpiData();
  }, []); // [] รันแค่ครั้งเดียว

  // --- Effect 2: โหลดข้อมูลฝน (เมื่อฟิลเตอร์เปลี่ยน) ---
  useEffect(() => {
    async function loadRainData() {
      if (!selectedDcode) return;

      setIsLoadingRain(true);
      setDataError(null); // (ใหม่) เคลียร์ error เก่า
      try {
        // (แก้) เรียก API ที่ถูกต้อง
        const res = await fetch(
          `/api/rainfall?dcode=${selectedDcode}&month=${selectedMonth}`
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.details || `API call failed with status: ${res.status}`
          );
        }
        const data = await res.json();
        setRainChartData(data);
      } catch (error) {
        console.error("Failed to fetch rain data:", error);
        setRainChartData(null);
        setDataError(`Rain API Error: ${error.message}`);
      } finally {
        setIsLoadingRain(false);
      }
    }

    loadRainData();
  }, [selectedDcode, selectedMonth]);

  // ประมวลผล KPI Card จาก State ที่เราเลือก
  const selectedDistrictInfo = isLoading
    ? null
    : districtData.find((d) => d.dcode == selectedDcode);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">
          Interactive Dashboard
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 text-center">
          เลือกเขตและเดือนที่คุณสนใจ เพื่อดูข้อมูลเชิงลึก
        </p>

        {/* --- ส่วน Loading (แบบง่าย) --- */}
        {isLoading && (
          <div className="text-center p-20 text-lg text-gray-600">
            กำลังโหลดข้อมูลเขต...
          </div>
        )}

        {/* --- ส่วนแสดงผล Dashboard (เมื่อโหลดเสร็จ) --- */}
        {!isLoading && (
          <>
            {/* --- 1. Filters --- */}
            <section className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 sticky top-20 z-40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="district-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Map className="w-5 h-5 inline-block mr-2" />
                    เลือกเขต:
                  </label>
                  <select
                    id="district-select"
                    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDcode}
                    onChange={(e) => setSelectedDcode(e.target.value)}
                  >
                    {districtData.map((d) => (
                      <option key={d.dcode} value={d.dcode}>
                        {d.dname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="month-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Calendar className="w-5 h-5 inline-block mr-2" />
                    เลือกเดือน (สำหรับกราฟฝน):
                  </label>
                  <select
                    id="month-select"
                    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* --- ส่วนแสดง Error --- */}
            {dataError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-8"
                role="alert"
              >
                <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                <span className="block sm:inline"> {dataError}</span>
              </div>
            )}

            {/* --- 2. KPI Cards (อัปเดตตามฟิลเตอร์) --- */}
            {selectedDistrictInfo && (
              <section className="mb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <KpiCard
                    title="กลุ่มความเสี่ยง"
                    value={selectedDistrictInfo.cluster}
                    unit="(Cluster)"
                    icon={AlertTriangle}
                  />
                  <KpiCard
                    title="จำนวนปั๊มทั้งหมด"
                    value={selectedDistrictInfo.pump_number}
                    unit="เครื่อง"
                    icon={Wind}
                  />
                  <KpiCard
                    title="อัตราส่วนปั๊มพร้อมใช้"
                    value={`${(
                      (+selectedDistrictInfo.pump_readiness_ratio || 0) * 100
                    ).toFixed(0)}%`}
                    unit=""
                    icon={ShieldCheck}
                  />
                </div>
              </section>
            )}

            {/* --- 3. กราฟฝน (Interactive) --- */}
            <section className="mb-16">
              <ChartBox
                title={`กราฟปริมาณน้ำฝน 24 ชม. (เขต${
                  selectedDistrictInfo?.dname || "..."
                })`}
                description={`แสดงข้อมูลฝนรายวันสำหรับเขตที่เลือก (${
                  months.find((m) => m.value == selectedMonth)?.name || ""
                })`}
              >
                {isLoadingRain && (
                  <div className="text-center p-10 h-[400px]">
                    กำลังโหลดข้อมูลกราฟฝน...
                  </div>
                )}
                {!isLoadingRain &&
                  (!rainChartData || rainChartData[0].data.length === 0) && (
                    <div className="text-center p-10 h-[400px] text-gray-500">
                      ไม่พบข้อมูลฝนสำหรับเขตหรือเดือนที่เลือก
                    </div>
                  )}
                {!isLoadingRain &&
                  rainChartData &&
                  rainChartData[0].data.length > 0 && (
                    <RainfallChart data={rainChartData} />
                  )}
              </ChartBox>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
