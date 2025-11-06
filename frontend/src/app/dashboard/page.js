// frontend/src/app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import {
  CorrelationHeatmap,
  FloodPointsBarChart,
  PopulationVsFloodScatterPlot,
  RainfallVsFloodPointScatterPlot,
  heatmapData,
} from "../components/EdaCharts";
import { ResponsiveLine } from "@nivo/line"; // (ใหม่) Import กราฟเส้น
import {
  Map,
  Users,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Grid,
  Droplet,
  Wind,
  Calendar,
} from "lucide-react";

// --- Component: KPI Card (ไม่เปลี่ยนแปลง) ---
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

// --- Component: Chart Box (ไม่เปลี่ยนแปลง) ---
const ChartBox = ({ title, description, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 overflow-x-auto">
      <div className="min-w-[600px] lg:min-w-full">{children}</div>
    </div>
  </div>
);

// --- (ใหม่) Component: กราฟเส้นสำหรับฝน ---
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
        <div className="bg-white p-2 rounded shadow border">
          <strong className="text-blue-600">{point.data.xFormatted}</strong>
          <br />
          <span className="text-gray-700">ฝน 24 ชม.: </span>
          <strong className="text-blue-600">{point.data.yFormatted} มม.</strong>
        </div>
      )}
    />
  </div>
);

// --- (ใหม่) รายชื่อเดือนสำหรับ Filter ---
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
  const [districtData, setDistrictData] = useState([]); // (แก้) ข้อมูลเขตทั้งหมด
  const [chartData, setChartData] = useState(null); // (แก้) ข้อมูลกราฟ EDA
  const [rainChartData, setRainChartData] = useState(null); // (ใหม่) ข้อมูลกราฟฝน

  const [isLoadingKpi, setIsLoadingKpi] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [isLoadingRain, setIsLoadingRain] = useState(true);
  const [dataError, setDataError] = useState(null);

  // (ใหม่) State สำหรับ Filters
  const [selectedDcode, setSelectedDcode] = useState("1001"); // เริ่มต้นที่ เขตพระนคร
  const [selectedMonth, setSelectedMonth] = useState("all"); // เริ่มต้นที่ ดูทั้งปี

  // --- Effect 1: โหลดข้อมูล CSV หลัก (สำหรับ KPI และ EDA) ---
  useEffect(() => {
    async function loadCsvData() {
      setIsLoadingKpi(true);
      setIsLoadingCharts(true);
      try {
        const [clusterCsvData, featuresCsv] = await Promise.all([
          csv("/data/master_features_clustered.csv"),
          csv("/data/master_features_engineered.csv"),
        ]);

        const validDistricts = clusterCsvData
          .filter((d) => d.dcode && d.dname)
          .sort((a, b) => a.dname.localeCompare(b.dname)); // เรียงตามชื่อเขต

        setDistrictData(validDistricts); // (ใหม่) เก็บข้อมูลเขตทั้งหมด

        // (ส่วนนี้เหมือนเดิม)
        const processedFeatures = featuresCsv.map((d) => ({
          dname: d.dname,
          district_group: d.district_group,
          flood_point_count: +d.flood_point_count || 0,
          population_density: +d.population_density || 0,
          rain_max_24h: +d.rain_max_24h || 0,
        }));

        const barChartData = [...processedFeatures]
          .sort((a, b) => b.flood_point_count - a.flood_point_count)
          .slice(0, 10)
          .map((d) => ({
            district: d.dname,
            จำนวนจุดอ่อนน้ำท่วม: d.flood_point_count,
          }))
          .sort((a, b) => a["จำนวนจุดอ่อนน้ำท่วม"] - b["จำนวนจุดอ่อนน้ำท่วม"]);
        const scatterPlotData = Object.values(
          processedFeatures.reduce((acc, d) => {
            const group = d.district_group;
            if (group && typeof group === "string" && group.trim() !== "") {
              if (!acc[group]) acc[group] = { id: group, data: [] };
              acc[group].data.push({
                x: d.population_density,
                y: d.flood_point_count,
                name: d.dname,
              });
            }
            return acc;
          }, {})
        );
        const rainVsFloodData = Object.values(
          processedFeatures.reduce((acc, d) => {
            const group = d.district_group;
            if (group && typeof group === "string" && group.trim() !== "") {
              if (!acc[group]) acc[group] = { id: group, data: [] };
              acc[group].data.push({
                x: d.rain_max_24h,
                y: d.flood_point_count,
                name: d.dname,
              });
            }
            return acc;
          }, {})
        );

        setChartData({ barChartData, scatterPlotData, rainVsFloodData });
      } catch (error) {
        console.error("Failed to load dashboard CSV data:", error);
        setDataError(error.message);
      } finally {
        setIsLoadingKpi(false);
        setIsLoadingCharts(false);
      }
    }
    loadCsvData();
  }, []); // [] รันแค่ครั้งเดียว

  // --- (ใหม่) Effect 2: โหลดข้อมูลฝน (เมื่อฟิลเตอร์เปลี่ยน) ---
  useEffect(() => {
    async function loadRainData() {
      if (!selectedDcode) return; // ถ้ายังไม่มี dcode ไม่ต้องทำ

      setIsLoadingRain(true);
      try {
        // เรียก API อัจฉริยะที่เราสร้าง
        const res = await fetch(
          `/api/rainfall?dcode=${selectedDcode}&month=${selectedMonth}`
        );
        if (!res.ok)
          throw new Error(`API call failed with status: ${res.status}`);
        const data = await res.json();
        setRainChartData(data);
      } catch (error) {
        console.error("Failed to fetch rain data:", error);
        setRainChartData(null); // ตั้งค่าเป็น null ถ้า error
      } finally {
        setIsLoadingRain(false);
      }
    }

    loadRainData();
  }, [selectedDcode, selectedMonth]); // (สำคัญ!) รันใหม่ทุกครั้งที่ dcode หรือ month เปลี่ยน

  // (ใหม่) ประมวลผล KPI Card จาก State ที่เราเลือก
  const selectedDistrictInfo = districtData.find(
    (d) => d.dcode == selectedDcode
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">
          แดชบอร์ดวิเคราะห์ความเสี่ยงน้ำท่วม กรุงเทพมหานคร 2567
        </h1>

        {/* --- (ใหม่) 1. Filters --- */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="district-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                เลือกเขต:
              </label>
              <select
                id="district-select"
                className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={selectedDcode}
                onChange={(e) => setSelectedDcode(e.target.value)}
                disabled={isLoadingKpi}
              >
                {isLoadingKpi ? (
                  <option>กำลังโหลดเขต...</option>
                ) : (
                  districtData.map((d) => (
                    <option key={d.dcode} value={d.dcode}>
                      {d.dname}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="month-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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

        {/* --- 2. KPI Cards (อัปเดตตามฟิลเตอร์) --- */}
        <section className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <KpiCard
              title="กลุ่มความเสี่ยง"
              value={selectedDistrictInfo?.cluster ?? "N/A"}
              unit="(Cluster)"
              icon={AlertTriangle}
            />
            <KpiCard
              title="จำนวนปั๊มทั้งหมด"
              value={selectedDistrictInfo?.pump_number ?? "N/A"}
              unit="เครื่อง"
              icon={Wind}
            />
            <KpiCard
              title="อัตราส่วนปั๊มพร้อมใช้"
              value={`${(
                (selectedDistrictInfo?.pump_readiness_ratio || 0) * 100
              ).toFixed(0)}%`}
              unit=""
              icon={ShieldCheck}
            />
          </div>
        </section>

        {/* --- (ใหม่) 3. กราฟฝน (Interactive) --- */}
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
              <div className="text-center p-10">กำลังโหลดข้อมูลกราฟฝน...</div>
            )}
            {!isLoadingRain &&
              (!rainChartData || rainChartData[0].data.length === 0) && (
                <div className="text-center p-10 text-gray-500">
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

        {/* --- 4. กราฟ EDA (ไม่เปลี่ยนแปลง) --- */}
        <section>
          <div className="flex justify-center items-center gap-4 mb-8">
            <Grid className="w-10 h-10 text-blue-600" />
            <BarChart3 className="w-10 h-10 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              ภาพรวมการสำรวจข้อมูล (EDA)
            </h2>
          </div>
          <div className="space-y-8">
            {isLoadingCharts && (
              <div className="text-center p-10">กำลังโหลดกราฟ EDA...</div>
            )}
            {!isLoadingCharts && chartData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartBox
                  title="1. Correlation Heatmap"
                  description="ความสัมพันธ์ระหว่างตัวแปร (ข้อมูล Hard-code)"
                >
                  <CorrelationHeatmap data={heatmapData} />
                </ChartBox>
                <ChartBox
                  title="2. Top 10 Districts by Flood Points"
                  description="10 อันดับเขตที่มีจุดอ่อนน้ำท่วมมากที่สุด"
                >
                  <FloodPointsBarChart data={chartData.barChartData} />
                </ChartBox>
                <ChartBox
                  title="3. Population Density vs. Flood Points"
                  description="เปรียบเทียบความหนาแน่นประชากร กับ จำนวนจุดอ่อนน้ำท่วม"
                >
                  <PopulationVsFloodScatterPlot
                    data={chartData.scatterPlotData}
                  />
                </ChartBox>
                <ChartBox
                  title="4. Max Rainfall vs. Flood Points"
                  description="เปรียบเทียบปริมาณฝนสูงสุด 24 ชม. กับ จำนวนจุดอ่อนน้ำท่วม"
                >
                  <RainfallVsFloodPointScatterPlot
                    data={chartData.rainVsFloodData}
                  />
                </ChartBox>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
