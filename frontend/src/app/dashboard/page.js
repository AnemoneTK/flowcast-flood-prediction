// frontend/src/app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { ResponsiveLine } from "@nivo/line";
import {
  Map,
  AlertTriangle,
  ShieldCheck,
  Wind,
  Calendar,
  TrendingUp,
} from "lucide-react";

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
      <div className="min-w-[500px] lg:min-w-full">{children}</div>
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
        format: "%b %d",
        tickValues: "every 7 days",
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

// --- Component: กราฟเส้นสำหรับ Risk Score ---
const RiskScoreChart = ({ data }) => (
  <div style={{ height: "400px", width: "100%" }}>
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
      xFormat="time:%Y-%m-%d"
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        format: "%b %d",
        tickValues: "every 7 days",
        legend: "วันที่",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        legend: "Risk Score",
        legendOffset: -45,
        legendPosition: "middle",
      }}
      colors={{ scheme: "red_yellow_green" }}
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
          <strong className="text-red-600">{point.data.xFormatted}</strong>
          <br />
          <span className="text-gray-700">Risk Score: </span>
          <strong className="text-red-600">{point.data.yFormatted}</strong>
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
  const [districtData, setDistrictData] = useState([]);
  const [rainChartData, setRainChartData] = useState(null);
  const [riskChartData, setRiskChartData] = useState(null);
  const [aggregateKpiData, setAggregateKpiData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRain, setIsLoadingRain] = useState(true);
  const [isLoadingRisk, setIsLoadingRisk] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [selectedDcode, setSelectedDcode] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // --- Effect 1: โหลดข้อมูล CSV หลัก (สำหรับ KPI และ Dropdown) ---
  useEffect(() => {
    async function loadKpiData() {
      try {
        const clusterCsvData = await csv(
          "/data/master_features_clustered_seasonal.csv"
        );

        const validDistricts = clusterCsvData
          .filter((d) => d.dcode && d.dname)
          .sort((a, b) => a.dname.localeCompare(b.dname));

        const totalPumps = validDistricts.reduce(
          (sum, d) => sum + (+d.pump_number || 0),
          0
        );
        const totalRatio = validDistricts.reduce(
          (sum, d) => sum + (+d.pump_readiness_ratio || 0),
          0
        );
        const avgRatio =
          validDistricts.length > 0
            ? (totalRatio / validDistricts.length) * 100
            : 0;

        setAggregateKpiData({
          pump_number: totalPumps,
          pump_readiness_ratio: `${avgRatio.toFixed(0)}%`,
          cluster: "ทั้งหมด",
        });

        setDistrictData([
          { dcode: "all", dname: "--- แสดงข้อมูลทุกเขต ---" },
          ...validDistricts,
        ]);
      } catch (error) {
        console.error("Failed to load cluster data:", error);
        setDataError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadKpiData();
  }, []);

  // --- Effect 2: โหลดข้อมูลฝน (เมื่อฟิลเตอร์เปลี่ยน) ---
  useEffect(() => {
    async function loadRainData() {
      if (!selectedDcode) return;

      if (selectedDcode === "all" && selectedMonth === "all") {
        setIsLoadingRain(false);
        setRainChartData(null);
        return;
      }

      setIsLoadingRain(true);
      setDataError(null);
      try {
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

  // --- Effect 3: โหลดข้อมูล Risk Score (เมื่อฟิลเตอร์เปลี่ยน) ---
  useEffect(() => {
    async function loadRiskData() {
      if (!selectedDcode) return;

      if (selectedDcode === "all" && selectedMonth === "all") {
        setIsLoadingRisk(false);
        setRiskChartData(null);
        return;
      }

      setIsLoadingRisk(true);
      try {
        const res = await fetch(
          `/api/risk-scores?dcode=${selectedDcode}&month=${selectedMonth}`
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.details || `API call failed with status: ${res.status}`
          );
        }
        const data = await res.json();
        setRiskChartData(data);
      } catch (error) {
        console.error("Failed to fetch risk data:", error);
        setRiskChartData(null);
        if (!dataError) {
          setDataError(`Risk API Error: ${error.message}`);
        }
      } finally {
        setIsLoadingRisk(false);
      }
    }

    loadRiskData();
  }, [selectedDcode, selectedMonth]);

  // ประมวลผล KPI Card จาก State ที่เราเลือก
  const selectedDistrictInfo =
    isLoading || selectedDcode === "all"
      ? null
      : districtData.find((d) => d.dcode == selectedDcode);

  const kpiToShow = {
    cluster:
      selectedDcode === "all"
        ? aggregateKpiData?.cluster
        : selectedDistrictInfo?.cluster,
    pump_number:
      selectedDcode === "all"
        ? aggregateKpiData?.pump_number
        : selectedDistrictInfo?.pump_number,
    pump_readiness_ratio:
      selectedDcode === "all"
        ? aggregateKpiData?.pump_readiness_ratio
        : `${((+selectedDistrictInfo?.pump_readiness_ratio || 0) * 100).toFixed(
            0
          )}%`,
  };

  const selectedMonthName =
    months.find((m) => m.value == selectedMonth)?.name || "";

  const chartDistrictName =
    selectedDcode === "all"
      ? "ทุกเขต (เฉลี่ย)"
      : `เขต${selectedDistrictInfo?.dname || "..."}`;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">
          Interactive Dashboard
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 text-center">
          เลือกเขตและเดือนที่คุณสนใจ เพื่อดูข้อมูลเชิงลึก
        </p>

        {isLoading && (
          <div className="text-center p-20 text-lg text-gray-600">
            กำลังโหลดข้อมูลเขต...
          </div>
        )}

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
                    เลือกเดือน (สำหรับกราฟ):
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

            {dataError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-8"
                role="alert"
              >
                <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                <span className="block sm:inline"> {dataError}</span>
              </div>
            )}

            {/* --- 2. KPI Cards --- */}
            {kpiToShow && (
              <section className="mb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <KpiCard
                    title="กลุ่มความเสี่ยง"
                    value={kpiToShow.cluster || "..."}
                    unit={selectedDcode !== "all" ? "(Cluster)" : ""}
                    icon={AlertTriangle}
                  />
                  <KpiCard
                    title={
                      selectedDcode === "all"
                        ? "จำนวนปั๊ม (รวมทุกเขต)"
                        : "จำนวนปั๊มทั้งหมด"
                    }
                    value={kpiToShow.pump_number ?? "..."}
                    unit="เครื่อง"
                    icon={Wind}
                  />
                  <KpiCard
                    title={
                      selectedDcode === "all"
                        ? "อัตราส่วนปั๊มพร้อมใช้ (เฉลี่ย)"
                        : "อัตราส่วนปั๊มพร้อมใช้"
                    }
                    value={kpiToShow.pump_readiness_ratio ?? "..."}
                    unit={selectedDcode === "all" ? "" : ""}
                    icon={ShieldCheck}
                  />
                </div>
              </section>
            )}

            {/* --- (ปรับแก้) 3. & 4. กราฟ (Interactive) --- */}
            <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* กราฟฝน */}
              <ChartBox
                title={`กราฟปริมาณน้ำฝน 24 ชม. (${chartDistrictName})`}
                description={`แสดงข้อมูลฝนรายวันสำหรับ ${selectedMonthName}`}
              >
                {isLoadingRain && (
                  <div className="text-center p-10 h-[400px]">
                    กำลังโหลดข้อมูลกราฟฝน...
                  </div>
                )}
                {!isLoadingRain &&
                  (!rainChartData ||
                    !rainChartData[0] ||
                    rainChartData[0].data.length === 0) && (
                    <div className="text-center p-10 h-[400px] text-gray-500">
                      {selectedDcode === "all" && selectedMonth === "all"
                        ? "กรุณาเลือกเดือน เพื่อดูข้อมูลกราฟ"
                        : "ไม่พบข้อมูลฝนสำหรับเขตหรือเดือนที่เลือก"}
                    </div>
                  )}
                {!isLoadingRain &&
                  rainChartData &&
                  rainChartData[0] &&
                  rainChartData[0].data.length > 0 && (
                    <RainfallChart data={rainChartData} />
                  )}
              </ChartBox>

              {/* กราฟ Risk Score */}
              <ChartBox
                title={`กราฟ Risk Score (${chartDistrictName})`}
                description={`แสดงข้อมูล Risk Score รายวันสำหรับ ${selectedMonthName}`}
              >
                {isLoadingRisk && (
                  <div className="text-center p-10 h-[400px]">
                    กำลังโหลดข้อมูลกราฟ Risk Score...
                  </div>
                )}
                {!isLoadingRisk &&
                  (!riskChartData ||
                    !riskChartData[0] ||
                    riskChartData[0].data.length === 0) && (
                    <div className="text-center p-10 h-[400px] text-gray-500">
                      {selectedDcode === "all" && selectedMonth === "all"
                        ? "กรุณาเลือกเดือน เพื่อดูข้อมูลกราฟ"
                        : "ไม่พบข้อมูล Risk Score สำหรับเขตหรือเดือนที่เลือก"}
                    </div>
                  )}
                {!isLoadingRisk &&
                  riskChartData &&
                  riskChartData[0] &&
                  riskChartData[0].data.length > 0 && (
                    <RiskScoreChart data={riskChartData} />
                  )}
              </ChartBox>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
