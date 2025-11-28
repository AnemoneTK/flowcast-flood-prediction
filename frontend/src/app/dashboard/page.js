// // frontend/src/app/dashboard/page.js
// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { csv } from "d3-fetch";
// import dynamic from "next/dynamic"; // (สำคัญ) ต้องมี dynamic
// import { ResponsiveLine } from "@nivo/line";
// import { ResponsiveBar } from "@nivo/bar";
// import Select from "react-select";
// import {
//   Map as MapIcon,
//   AlertTriangle,
//   ShieldCheck,
//   Wind,
//   Calendar,
//   TrendingUp,
//   Activity,
//   Waves,
// } from "lucide-react";

// // (สำคัญ!) โหลด Map Component แบบ Dynamic
// const MapComponent = dynamic(() => import("../components/InteractiveMap"), {
//   ssr: false, // ปิด Server-Side Rendering
//   loading: () => (
//     <div className="text-center p-10 h-[500px]">กำลังโหลดแผนที่...</div>
//   ),
// });

// // (โค้ดส่วน Styles, Components, KpiCard, ChartBox, กราฟ 3 อัน ไม่เปลี่ยนแปลง)
// // ...
// const customStyles = {
//   control: (provided, state) => ({
//     ...provided,
//     padding: "0.35rem",
//     borderColor: state.isFocused ? "rgb(59 130 246)" : "rgb(209 213 219)",
//     borderRadius: "0.375rem",
//     boxShadow: state.isFocused ? "0 0 0 1px rgb(59 130 246)" : "none",
//     "&:hover": {
//       borderColor: state.isFocused ? "rgb(59 130 246)" : "rgb(156 163 175)",
//     },
//   }),
//   menu: (provided) => ({
//     ...provided,
//     zIndex: 50,
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: state.isSelected
//       ? "rgb(59 130 246)"
//       : state.isFocused
//       ? "rgb(239 246 255)"
//       : "white",
//     color: state.isSelected ? "white" : "black",
//   }),
// };

// const KpiCard = ({ title, value, icon: Icon, unit }) => (
//   <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <p className="text-3xl font-bold text-gray-900">
//           {value}{" "}
//           <span className="text-lg font-medium text-gray-600">{unit}</span>
//         </p>
//       </div>
//       <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
//         <Icon className="w-6 h-6" />
//       </div>
//     </div>
//   </div>
// );

// const ChartBox = ({ title, description, children }) => (
//   <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
//     <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
//     <p className="text-sm text-gray-600 mb-4">{description}</p>
//     <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 overflow-x-auto">
//       <div className="min-w-[500px] lg:min-w-full">{children}</div>
//     </div>
//   </div>
// );

// const RainfallChart = ({ data }) => (
//   <div style={{ height: "400px", width: "100%" }}>
//     <ResponsiveLine
//       data={data}
//       margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
//       xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
//       xFormat="time:%Y-%m-%d"
//       yScale={{
//         type: "linear",
//         min: "auto",
//         max: "auto",
//         stacked: false,
//         reverse: false,
//       }}
//       yFormat=" >-.2f"
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         format: "%b %d",
//         tickValues: "every 7 days",
//         legend: "วันที่",
//         legendOffset: 36,
//         legendPosition: "middle",
//       }}
//       axisLeft={{
//         legend: "ปริมาณฝน (มม.)",
//         legendOffset: -45,
//         legendPosition: "middle",
//       }}
//       colors={{ scheme: "category10" }}
//       pointSize={4}
//       pointColor={{ theme: "background" }}
//       pointBorderWidth={2}
//       pointBorderColor={{ from: "serieColor" }}
//       pointLabelYOffset={-12}
//       useMesh={true}
//       enableArea={true}
//       areaOpacity={0.1}
//       tooltip={({ point }) => (
//         <div className="bg-white p-2 rounded shadow border w-48">
//           <strong className="text-blue-600">{point.data.xFormatted}</strong>
//           <br />
//           <span className="text-gray-700">ฝน 24 ชม.: </span>
//           <strong className="text-blue-600">{point.data.yFormatted} มม.</strong>
//         </div>
//       )}
//     />
//   </div>
// );

// const RiskScoreChart = ({ data }) => (
//   <div style={{ height: "400px", width: "100%" }}>
//     <ResponsiveLine
//       data={data}
//       margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
//       xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
//       xFormat="time:%Y-%m-%d"
//       yScale={{
//         type: "linear",
//         min: 0,
//         max: "auto",
//         stacked: false,
//         reverse: false,
//       }}
//       yFormat=" >-.2f"
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         format: "%b %d",
//         tickValues: "every 7 days",
//         legend: "วันที่",
//         legendOffset: 36,
//         legendPosition: "middle",
//       }}
//       axisLeft={{
//         legend: "Risk Score",
//         legendOffset: -45,
//         legendPosition: "middle",
//       }}
//       colors={{ scheme: "red_yellow_green" }}
//       pointSize={4}
//       pointColor={{ theme: "background" }}
//       pointBorderWidth={2}
//       pointBorderColor={{ from: "serieColor" }}
//       pointLabelYOffset={-12}
//       useMesh={true}
//       enableArea={true}
//       areaOpacity={0.1}
//       tooltip={({ point }) => (
//         <div className="bg-white p-2 rounded shadow border w-48">
//           <strong className="text-red-600">{point.data.xFormatted}</strong>
//           <br />
//           <span className="text-gray-700">Risk Score: </span>
//           <strong className="text-red-600">{point.data.yFormatted}</strong>
//         </div>
//       )}
//     />
//   </div>
// );

// const RiskBarChart = ({ data }) => (
//   <div style={{ height: "400px", width: "100%" }}>
//     <ResponsiveBar
//       data={data}
//       keys={["value"]}
//       indexBy="dname"
//       margin={{ top: 10, right: 50, bottom: 50, left: 150 }}
//       padding={0.3}
//       valueScale={{ type: "linear" }}
//       indexScale={{ type: "band", round: true }}
//       colors={{ scheme: "red_yellow_green" }}
//       borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
//       layout="horizontal"
//       axisTop={null}
//       axisRight={null}
//       axisBottom={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: "คะแนนรวมความเสี่ยง (สะสมทั้งปี)",
//         legendPosition: "middle",
//         legendOffset: 32,
//       }}
//       axisLeft={{
//         tickSize: 5,
//         tickPadding: 5,
//         tickRotation: 0,
//         legend: null,
//       }}
//       labelSkipWidth={12}
//       labelSkipHeight={12}
//       labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
//       tooltip={({ id, value, indexValue }) => (
//         <div className="bg-white p-2 rounded shadow border">
//           <strong className="text-red-600">{indexValue}</strong>
//           <br />
//           <span className="text-gray-700">{id}: </span>
//           <strong className="text-red-600">{value}</strong>
//         </div>
//       )}
//     />
//   </div>
// );

// const months = [
//   { value: "all", name: "ดูทั้งปี" },
//   { value: "1", name: "มกราคม" },
//   { value: "2", name: "กุมภาพันธ์" },
//   { value: "3", name: "มีนาคม" },
//   { value: "4", name: "เมษายน" },
//   { value: "5", name: "พฤษภาคม" },
//   { value: "6", name: "มิถุนายน" },
//   { value: "7", name: "กรกฎาคม" },
//   { value: "8", name: "สิงหาคม" },
//   { value: "9", name: "กันยายน" },
//   { value: "10", name: "ตุลาคม" },
//   { value: "11", name: "พฤศจิกายน" },
//   { value: "12", name: "ธันวาคม" },
// ];
// // ... (โค้ดส่วน DashboardPage, States, Effects 1, 2, 3, 4 ไม่เปลี่ยนแปลง) ...
// export default function DashboardPage() {
//   const [districtData, setDistrictData] = useState([]);
//   const [rainChartData, setRainChartData] = useState(null);
//   const [riskChartData, setRiskChartData] = useState(null);
//   const [aggregateKpiData, setAggregateKpiData] = useState(null);
//   const [riskBarData, setRiskBarData] = useState([]);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoadingRain, setIsLoadingRain] = useState(true);
//   const [isLoadingRisk, setIsLoadingRisk] = useState(true);
//   const [isLoadingRiskBar, setIsLoadingRiskBar] = useState(true);

//   const [dataError, setDataError] = useState(null);

//   const [selectedDcode, setSelectedDcode] = useState("all");
//   const [selectedMonth, setSelectedMonth] = useState("all");

//   // --- (ปรับแก้) Effect 1: โหลดและรวมข้อมูล KPI จากไฟล์ใหม่ ---
//   useEffect(() => {
//     async function loadKpiData() {
//       try {
//         // (ปรับแก้) โหลดไฟล์ master_district_features.csv ไฟล์เดียว
//         const masterData = await csv(
//           "/data/master_features_clustered_seasonal.csv"
//         );
//         console.log("Master District Features Data:", masterData);
//         const validDistricts = [];
//         for (const d of masterData) {
//           if (d.dcode && d.dname) {
//             validDistricts.push({
//               dcode: d.dcode.toString(),
//               dname: d.dname,
//               cluster: d.cluster, // (ปรับแก้) ใช้ 'district_group'
//               canal_count: +d.canal_count || 0,
//               pump_number: +d.pump_number || 0,
//               risk_point_count: +d["จำนวนจุดเสี่ยง"] || 0, // (แก้บั๊ก)
//               floodgate_count: +d.floodgate_count || 0,
//             });
//           }
//         }

//         validDistricts.sort((a, b) => a.dname.localeCompare(b.dname));

//         // 4. คำนวณ KPI ภาพรวม
//         const totalRiskPoints = validDistricts.reduce(
//           (sum, d) => sum + d.risk_point_count,
//           0
//         );
//         const totalCanals = validDistricts.reduce(
//           (sum, d) => sum + d.canal_count,
//           0
//         );
//         const totalPumps = validDistricts.reduce(
//           (sum, d) => sum + d.pump_number,
//           0
//         );
//         const totalFloodgates = validDistricts.reduce(
//           (sum, d) => sum + d.floodgate_count,
//           0
//         );

//         setAggregateKpiData({
//           pump_number: totalPumps,
//           cluster: "-",
//           risk_point_count: totalRiskPoints,
//           canal_count: totalCanals,
//           floodgate_count: totalFloodgates,
//         });

//         setDistrictData([
//           { dcode: "all", dname: "--- แสดงข้อมูลทุกเขต ---" },
//           ...validDistricts,
//         ]);
//       } catch (error) {
//         console.error("Failed to load cluster data:", error);
//         setDataError(error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     loadKpiData();
//   }, []);

//   // --- Effect 2: โหลดข้อมูลฝน (เมื่อฟิลเตอร์เปลี่ยน) ---
//   useEffect(() => {
//     async function loadRainData() {
//       if (!selectedDcode) return;

//       if (selectedDcode === "all" && selectedMonth === "all") {
//         setIsLoadingRain(false);
//         setRainChartData(null);
//         return;
//       }

//       setIsLoadingRain(true);
//       setDataError(null);
//       try {
//         const res = await fetch(
//           `/api/rainfall?dcode=${selectedDcode}&month=${selectedMonth}`
//         );
//         if (!res.ok) {
//           const errData = await res.json();
//           throw new Error(
//             errData.details || `API call failed with status: ${res.status}`
//           );
//         }
//         const data = await res.json();
//         setRainChartData(data);
//       } catch (error) {
//         console.error("Failed to fetch rain data:", error);
//         setRainChartData(null);
//         setDataError(`Rain API Error: ${error.message}`);
//       } finally {
//         setIsLoadingRain(false);
//       }
//     }

//     loadRainData();
//   }, [selectedDcode, selectedMonth]);

//   // --- Effect 3: โหลดข้อมูล Risk Score (เมื่อฟิลเตอร์เปลี่ยน) ---
//   useEffect(() => {
//     async function loadRiskData() {
//       if (!selectedDcode) return;

//       if (selectedDcode === "all" && selectedMonth === "all") {
//         setIsLoadingRisk(false);
//         setRiskChartData(null);
//         return;
//       }

//       setIsLoadingRisk(true);
//       try {
//         const res = await fetch(
//           `/api/risk-scores?dcode=${selectedDcode}&month=${selectedMonth}`
//         );
//         if (!res.ok) {
//           const errData = await res.json();
//           throw new Error(
//             errData.details || `API call failed with status: ${res.status}`
//           );
//         }
//         const data = await res.json();
//         setRiskChartData(data);
//       } catch (error) {
//         console.error("Failed to fetch risk data:", error);
//         setRiskChartData(null);
//         if (!dataError) {
//           setDataError(`Risk API Error: ${error.message}`);
//         }
//       } finally {
//         setIsLoadingRisk(false);
//       }
//     }

//     loadRiskData();
//   }, [selectedDcode, selectedMonth]);

//   // --- Effect 4: โหลดข้อมูลกราฟแท่ง (โหลดครั้งเดียว) ---
//   useEffect(() => {
//     async function loadRiskBarData() {
//       setIsLoadingRiskBar(true);
//       try {
//         const res = await fetch("/api/risk-total");
//         if (!res.ok) throw new Error("Failed to fetch risk totals");
//         const data = await res.json();
//         setRiskBarData(data);
//       } catch (error) {
//         console.error(error);
//         if (!dataError) {
//           setDataError(`Risk Bar API Error: ${error.message}`);
//         }
//       } finally {
//         setIsLoadingRiskBar(false);
//       }
//     }
//     loadRiskBarData();
//   }, []);
//   // ... (โค้ดส่วน kpiToShow, selectedMonthName, chartDistrictName, districtOptions, barChartDataToShow ไม่เปลี่ยนแปลง) ...
//   const selectedDistrictInfo =
//     isLoading || selectedDcode === "all"
//       ? null
//       : districtData.find((d) => d.dcode == selectedDcode);

//   const kpiToShow = {
//     cluster:
//       selectedDcode === "all"
//         ? aggregateKpiData?.cluster
//         : selectedDistrictInfo?.cluster,
//     pump_number:
//       selectedDcode === "all"
//         ? aggregateKpiData?.pump_number
//         : selectedDistrictInfo?.pump_number,
//     risk_point_count:
//       selectedDcode === "all"
//         ? aggregateKpiData?.risk_point_count
//         : selectedDistrictInfo?.risk_point_count,
//     canal_count:
//       selectedDcode === "all"
//         ? aggregateKpiData?.canal_count
//         : selectedDistrictInfo?.canal_count,
//     floodgate_count:
//       selectedDcode === "all"
//         ? aggregateKpiData?.floodgate_count
//         : selectedDistrictInfo?.floodgate_count,
//   };

//   const selectedMonthName =
//     months.find((m) => m.value == selectedMonth)?.name || "";

//   const chartDistrictName =
//     selectedDcode === "all"
//       ? "ทุกเขต (เฉลี่ย)"
//       : `เขต${selectedDistrictInfo?.dname || "..."}`;

//   const districtOptions = useMemo(
//     () =>
//       districtData.map((d) => ({
//         value: d.dcode,
//         label: d.dname,
//       })),
//     [districtData]
//   );

//   const barChartDataToShow = useMemo(() => {
//     if (isLoadingRiskBar || riskBarData.length === 0) return [];

//     if (selectedDcode === "all") {
//       return riskBarData
//         .map((d) => ({ ...d, value: +d.value }))
//         .sort((a, b) => b.value - a.value)
//         .slice(0, 10)
//         .reverse();
//     }

//     const districtData = riskBarData.find((d) => d.dcode == selectedDcode);
//     return districtData ? [districtData] : [];
//   }, [selectedDcode, riskBarData, isLoadingRiskBar]);

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <div className="container mx-auto p-4 py-16">
//         <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">
//           Flood Risk Dashboard for Bangkok 2024
//         </h1>
//         <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 text-center">
//           เลือกเขตและเดือนที่คุณสนใจ เพื่อดูข้อมูลเชิงลึก
//         </p>

//         {isLoading && (
//           <div className="text-center p-20 text-lg text-gray-600">
//             กำลังโหลดข้อมูลเขต...
//           </div>
//         )}

//         {!isLoading && (
//           <>
//             {/* --- 1. Filters --- */}
//             <section className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200 sticky top-20 z-40">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label
//                     htmlFor="district-select"
//                     className="block text-sm font-medium text-gray-700 mb-2"
//                   >
//                     <MapIcon className="w-5 h-5 inline-block mr-2" />
//                     เลือกเขต:
//                   </label>
//                   <Select
//                     id="district-select"
//                     instanceId="district-select-instance"
//                     options={districtOptions}
//                     value={districtOptions.find(
//                       (opt) => opt.value === selectedDcode
//                     )}
//                     onChange={(selectedOption) =>
//                       setSelectedDcode(selectedOption.value)
//                     }
//                     styles={customStyles}
//                     className="block w-full"
//                     classNamePrefix="react-select"
//                     placeholder="พิมพ์เพื่อค้นหาเขต..."
//                   />
//                 </div>
//                 <div>
//                   <label
//                     htmlFor="month-select"
//                     className="block text-sm font-medium text-gray-700 mb-2"
//                   >
//                     <Calendar className="w-5 h-5 inline-block mr-2" />
//                     เลือกเดือน (สำหรับกราฟ):
//                   </label>
//                   <select
//                     id="month-select"
//                     className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
//                     value={selectedMonth}
//                     onChange={(e) => setSelectedMonth(e.target.value)}
//                   >
//                     {months.map((m) => (
//                       <option key={m.value} value={m.value}>
//                         {m.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </section>

//             {dataError && (
//               <div
//                 className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-8"
//                 role="alert"
//               >
//                 <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
//                 <span className="block sm:inline"> {dataError}</span>
//               </div>
//             )}

//             {/* --- 2. KPI Cards (ปรับแก้) --- */}
//             {kpiToShow && (
//               <section className="mb-16">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
//                   <KpiCard
//                     title="กลุ่มความเสี่ยง"
//                     value={kpiToShow.cluster ?? "-"}
//                     unit={selectedDcode !== "all" ? "(Cluster)" : ""}
//                     icon={AlertTriangle}
//                   />
//                   <KpiCard
//                     title={
//                       selectedDcode === "all"
//                         ? "จุดเสี่ยง (รวม)"
//                         : "จำนวนจุดเสี่ยง"
//                     }
//                     value={kpiToShow.risk_point_count ?? "..."}
//                     unit="จุด"
//                     icon={Activity}
//                   />
//                   <KpiCard
//                     title={selectedDcode === "all" ? "คลอง (รวม)" : "จำนวนคลอง"}
//                     value={kpiToShow.canal_count ?? "..."}
//                     unit="แห่ง"
//                     icon={Waves}
//                   />
//                   <KpiCard
//                     title={
//                       selectedDcode === "all" ? "ปั๊ม (รวมทุกเขต)" : "จำนวนปั๊ม"
//                     }
//                     value={kpiToShow.pump_number ?? "..."}
//                     unit="เครื่อง"
//                     icon={Wind}
//                   />
//                   <KpiCard
//                     title={
//                       selectedDcode === "all"
//                         ? "ประตูน้ำ (รวม)"
//                         : "จำนวนประตูน้ำ"
//                     }
//                     value={kpiToShow.floodgate_count ?? "..."}
//                     unit="แห่ง"
//                     icon={ShieldCheck}
//                   />
//                 </div>
//               </section>
//             )}

//             {/* (ใหม่) 3. แผนที่ Interactive --- */}
//             <section className="mb-16">
//               <ChartBox
//                 title="แผนที่ข้อมูลเชิงพื้นที่"
//                 description="แสดงขอบเขตเขต, จุดเสี่ยงน้ำท่วม, และประตูน้ำ (สามารถคลิกเปิด/ปิด Layer ที่มุมบนขวาของแผนที่)"
//               >
//                 {/* (สำคัญ) ใช้ MapComponent ที่ import แบบ dynamic และส่ง dcode */}
//                 <MapComponent selectedDcode={selectedDcode} />
//               </ChartBox>
//             </section>

//             {/* --- 4. & 5. กราฟเส้น (Interactive) --- */}
//             <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* กราฟฝน */}
//               <ChartBox
//                 title={`กราฟปริมาณน้ำฝน 24 ชม. (${chartDistrictName})`}
//                 description={`แสดงข้อมูลฝนรายวันสำหรับ ${selectedMonthName}`}
//               >
//                 {isLoadingRain && (
//                   <div className="text-center p-10 h-[400px]">
//                     กำลังโหลดข้อมูลกราฟฝน...
//                   </div>
//                 )}
//                 {!isLoadingRain &&
//                   (!rainChartData ||
//                     !rainChartData[0] ||
//                     rainChartData[0].data.length === 0) && (
//                     <div className="text-center p-10 h-[400px] text-gray-500">
//                       {selectedDcode === "all" && selectedMonth === "all"
//                         ? "กรุณาเลือกเดือน เพื่อดูข้อมูลกราฟ"
//                         : "ไม่พบข้อมูลฝนสำหรับเขตหรือเดือนที่เลือก"}
//                     </div>
//                   )}
//                 {!isLoadingRain &&
//                   rainChartData &&
//                   rainChartData[0] &&
//                   rainChartData[0].data.length > 0 && (
//                     <RainfallChart data={rainChartData} />
//                   )}
//               </ChartBox>

//               {/* กราฟ Risk Score */}
//               <ChartBox
//                 title={`กราฟ Risk Score (${chartDistrictName})`}
//                 description={`แสดงข้อมูล Risk Score รายวันสำหรับ ${selectedMonthName}`}
//               >
//                 {isLoadingRisk && (
//                   <div className="text-center p-10 h-[400px]">
//                     กำลังโหลดข้อมูลกราฟ Risk Score...
//                   </div>
//                 )}
//                 {!isLoadingRisk &&
//                   (!riskChartData ||
//                     !riskChartData[0] ||
//                     riskChartData[0].data.length === 0) && (
//                     <div className="text-center p-10 h-[400px] text-gray-500">
//                       {selectedDcode === "all" && selectedMonth === "all"
//                         ? "กรุณาเลือกเดือน เพื่อดูข้อมูลกราฟ"
//                         : "ไม่พบข้อมูล Risk Score สำหรับเขตหรือเดือนที่เลือก"}
//                     </div>
//                   )}
//                 {!isLoadingRisk &&
//                   riskChartData &&
//                   riskChartData[0] &&
//                   riskChartData[0].data.length > 0 && (
//                     <RiskScoreChart data={riskChartData} />
//                   )}
//               </ChartBox>
//             </section>

//             {/* --- 6. กราฟแท่ง Risk Total --- */}
//             <section className="mb-16">
//               <ChartBox
//                 title={
//                   selectedDcode === "all"
//                     ? "คะแนนรวมความเสี่ยง (Top 10 เขต)"
//                     : `คะแนนรวมความเสี่ยง (เขต${
//                         selectedDistrictInfo?.dname || "..."
//                       })`
//                 }
//                 description="แสดงคะแนนความเสี่ยงรวมสะสมตลอดทั้งปี 2024"
//               >
//                 {isLoadingRiskBar && (
//                   <div className="text-center p-10 h-[400px]">
//                     กำลังโหลดข้อมูลกราฟ...
//                   </div>
//                 )}
//                 {!isLoadingRiskBar && barChartDataToShow.length === 0 && (
//                   <div className="text-center p-10 h-[400px] text-gray-500">
//                     ไม่พบข้อมูลคะแนนรวมสำหรับเขตที่เลือก
//                   </div>
//                 )}
//                 {!isLoadingRiskBar && barChartDataToShow.length > 0 && (
//                   <RiskBarChart data={barChartDataToShow} />
//                 )}
//               </ChartBox>
//             </section>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudRain,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Activity,
  Map,
  BarChart3,
  ArrowRight,
  X,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { DistrictRadarChart } from "../components/DashboardCharts";

// Setup Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [districts, setDistricts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bkkAvg, setBkkAvg] = useState({}); // ค่าเฉลี่ย L2

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // 1. ดึงข้อมูลเขต (L1/L2 Static Data)
    const { data: distData } = await supabase
      .from("districts")
      .select("*")
      .order("dname");

    // 2. ดึงข้อมูลพยากรณ์ล่าสุด (L3 Dynamic Data)
    // หาวันที่ที่มีข้อมูลล่าสุด (เผื่อวันพรุ่งนี้ยังไม่มี)
    const today = new Date().toISOString().split("T")[0];
    const { data: predData } = await supabase
      .from("predictions")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true }); // เอาวันใกล้สุด

    if (distData && distData.length > 0) {
      // คำนวณค่าเฉลี่ย กทม. (L2 Benchmark)
      const totalArea = distData.reduce((sum, d) => sum + d.area, 0);
      const totalPumps = distData.reduce((sum, d) => sum + d.pump_number, 0);
      const totalCanals = distData.reduce((sum, d) => sum + d.canal_count, 0);
      const totalFloodPts = distData.reduce(
        (sum, d) => sum + d.flood_point_count,
        0
      );
      const totalPop = distData.reduce((sum, d) => sum + d.population, 0);

      setBkkAvg({
        pump_density: totalPumps / totalArea,
        canal_density: totalCanals / totalArea,
        flood_point_count: totalFloodPts / distData.length,
        pump_number: totalPumps / distData.length,
        population: totalPop / distData.length,
      });

      // Map Prediction เข้ากับ District
      const combinedData = distData.map((d) => {
        // หาพยากรณ์ของเขตนี้ (เอาวันแรกที่เจอ)
        const pred = predData?.find((p) => p.dcode === d.dcode) || {};
        return {
          ...d,
          ...pred,
          // ถ้าไม่มีพยากรณ์ ให้ใส่ Default
          risk_level: pred.risk_level || "Low Risk",
          rain_load: pred.rain_load || 0,
          recommended_pumps: pred.recommended_pumps || 0,
        };
      });

      // Sort: เอาเขตเสี่ยงขึ้นก่อน (ถ้าไม่มีเสี่ยง เอาที่มีจุดเสี่ยงน้ำท่วมเยอะขึ้นก่อน)
      combinedData.sort((a, b) => {
        if (a.risk_level === "High Risk" && b.risk_level !== "High Risk")
          return -1;
        if (b.risk_level === "High Risk" && a.risk_level !== "High Risk")
          return 1;
        return b.flood_point_count - a.flood_point_count;
      });

      setDistricts(combinedData);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 space-y-12">
        {/* --- Section 1: L1 Descriptive (ภาพรวมสถานการณ์) --- */}
        <header>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              L1 Descriptive
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Bangkok Flood Monitor
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            ติดตามสถานการณ์น้ำท่วมและวิเคราะห์ความพร้อมของโครงสร้างพื้นฐานทั้ง
            50 เขต
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="เขตเฝ้าระวัง (จุดเสี่ยงเยอะ)"
            value={districts.filter((d) => d.flood_point_count > 5).length}
            label="เขต"
            icon={<AlertTriangle size={24} />}
            color="bg-orange-50 text-orange-600 border-orange-100"
          />
          <StatCard
            title="ความพร้อมปั๊มน้ำเฉลี่ย"
            value={bkkAvg.pump_number ? bkkAvg.pump_number.toFixed(1) : 0}
            label="เครื่อง/เขต"
            icon={<Activity size={24} />}
            color="bg-blue-50 text-blue-600 border-blue-100"
          />
          <StatCard
            title="เขตที่ระบบน้ำดีเยี่ยม"
            value={
              districts.filter(
                (d) => d.pump_number / d.area > bkkAvg.pump_density * 1.5
              ).length
            }
            label="เขต"
            icon={<CheckCircle size={24} />}
            color="bg-emerald-50 text-emerald-600 border-emerald-100"
          />
          <StatCard
            title="สถานะพยากรณ์วันนี้"
            value={
              districts.some((d) => d.risk_level === "High Risk")
                ? "CRITICAL"
                : "NORMAL"
            }
            label="L3 Status"
            icon={<CloudRain size={24} />}
            color={
              districts.some((d) => d.risk_level === "High Risk")
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-slate-50 text-slate-600 border-slate-100"
            }
          />
        </div>

        {/* --- Section 2: L2 & L3 List (รายชื่อเขต) --- */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Map size={20} className="text-purple-500" />
                District Analysis & Forecast
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                เรียงลำดับตามความเปราะบางของพื้นที่ (L2) และความเสี่ยงพยากรณ์
                (L3)
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400 animate-pulse">
              Loading Districts...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {districts.map((d) => (
                <motion.div
                  key={d.dcode}
                  layoutId={`card-${d.dcode}`}
                  onClick={() => setSelectedDistrict(d)}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                          {d.dname}
                        </h3>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Code: {d.dcode}
                        </div>
                      </div>
                      {/* L3 Status Badge */}
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          d.risk_level === "High Risk"
                            ? "bg-red-100 text-red-600"
                            : d.risk_level === "Well Managed"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {d.risk_level === "High Risk"
                          ? "L3: HIGH RISK"
                          : "L3: NORMAL"}
                      </span>
                    </div>

                    {/* L2 Mini Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-2 rounded text-center">
                        <div className="text-xs text-slate-500">ปั๊มน้ำ</div>
                        <div className="font-bold text-slate-700">
                          {d.pump_number}{" "}
                          <span className="text-[10px] font-normal">
                            เครื่อง
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded text-center">
                        <div className="text-xs text-slate-500">จุดเสี่ยง</div>
                        <div
                          className={`font-bold ${
                            d.flood_point_count > 5
                              ? "text-orange-500"
                              : "text-slate-700"
                          }`}
                        >
                          {d.flood_point_count}{" "}
                          <span className="text-[10px] font-normal">จุด</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-50">
                      <span className="text-slate-400">
                        กดเพื่อดู Insight (L2)
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-slate-300 group-hover:text-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  {/* L4 Indicator Bar (ถ้ามีคำแนะนำ) */}
                  {d.recommended_pumps > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold py-1 text-center">
                      🚨 L4 Action Required: +{d.recommended_pumps} Pumps
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* --- MODAL: Deep Dive (L2 + L4) --- */}
        <AnimatePresence>
          {selectedDistrict && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedDistrict(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">
                      {selectedDistrict.dname}
                    </h2>
                    <div className="flex gap-3 mt-2">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        L2 Diagnostic
                      </span>
                      {selectedDistrict.risk_level === "High Risk" && (
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          ⚠️ High Risk Forecast
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDistrict(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-8 grid md:grid-cols-12 gap-10">
                  {/* Left: Radar Chart (L2) */}
                  <div className="md:col-span-5">
                    <h3 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
                      <BarChart3 size={20} className="text-blue-500" />
                      Structural Analysis (วิเคราะห์โครงสร้าง)
                    </h3>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-2">
                      {/* กราฟ Radar L2 */}
                      <DistrictRadarChart
                        data={selectedDistrict}
                        avgData={bkkAvg}
                      />
                    </div>
                    <div className="mt-4 text-sm text-slate-600 space-y-2">
                      <p>
                        <strong>การอ่านค่า:</strong>{" "}
                        กราฟสีน้ำเงินแสดงศักยภาพของเขตเทียบกับค่าเฉลี่ย กทม.
                        (สีเทา)
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          หากพื้นที่กราฟ <strong>เล็กกว่าสีเทา</strong> =
                          โครงสร้างพื้นฐานยังไม่ดีพอ (จุดอ่อน)
                        </li>
                        <li>
                          หากพื้นที่กราฟ <strong>ใหญ่กว่า</strong> =
                          มีความพร้อมสูง
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right: Stats & Action (L4) */}
                  <div className="md:col-span-7 space-y-8">
                    {/* L2 Stats Details */}
                    <div>
                      <h3 className="font-bold text-lg text-slate-700 mb-4">
                        ข้อมูลเชิงลึกพื้นที่ (Spatial Data)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailBox
                          label="พื้นที่เขต"
                          value={selectedDistrict.area.toLocaleString()}
                          unit="ตร.ม."
                        />
                        <DetailBox
                          label="ประชากร"
                          value={selectedDistrict.population.toLocaleString()}
                          unit="คน"
                        />
                        <DetailBox
                          label="จุดเสี่ยงน้ำท่วม"
                          value={selectedDistrict.flood_point_count}
                          unit="จุด"
                          highlight={selectedDistrict.flood_point_count > 5}
                        />
                        <DetailBox
                          label="คลองสายหลัก"
                          value={selectedDistrict.canal_count}
                          unit="สาย"
                        />
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* L4 Recommendation */}
                    <div>
                      <h3 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
                        <Zap
                          size={20}
                          className={
                            selectedDistrict.recommended_pumps > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        />
                        AI Recommendation (L4 Prescriptive)
                      </h3>

                      {selectedDistrict.recommended_pumps > 0 ? (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                          <div className="text-red-800 font-medium mb-2">
                            🚨 ตรวจพบความเสี่ยงสูง (L3 Prediction)
                          </div>
                          <p className="text-sm text-red-600/80 mb-4">
                            โมเดลคาดการณ์ว่าปริมาณฝนจะเกินขีดความสามารถระบายน้ำของเขต
                            ระบบแนะนำมาตรการดังนี้:
                          </p>
                          <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-red-200">
                              +{selectedDistrict.recommended_pumps}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">
                                ติดตั้งเครื่องสูบน้ำเสริมทันที
                              </div>
                              <div className="text-xs text-slate-500">
                                ชนิดหาบหาม หรือ Mobile Unit ขนาด 3 ลบ.ม./วินาที
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
                          <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                            <CheckCircle size={24} />
                          </div>
                          <div>
                            <div className="text-emerald-800 font-bold mb-1">
                              สถานการณ์ปกติ
                            </div>
                            <p className="text-sm text-emerald-600/80">
                              ศักยภาพปั๊มน้ำปัจจุบัน (
                              {selectedDistrict.pump_number} เครื่อง)
                              เพียงพอต่อปริมาณฝนที่คาดการณ์
                              ไม่จำเป็นต้องเพิ่มทรัพยากร
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Sub-components ---
function StatCard({ title, value, label, icon, color }) {
  return (
    <div
      className={`p-6 rounded-2xl border shadow-sm flex items-start gap-4 ${color}`}
    >
      <div className="p-3 bg-white/60 rounded-full backdrop-blur-sm shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium opacity-80 mb-1">{title}</div>
        <div className="text-3xl font-extrabold">{value}</div>
        <div className="text-xs opacity-60 mt-1">{label}</div>
      </div>
    </div>
  );
}

function DetailBox({ label, value, unit, highlight = false }) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        highlight
          ? "bg-orange-50 border-orange-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div
        className={`font-bold text-lg ${
          highlight ? "text-orange-600" : "text-slate-700"
        }`}
      >
        {value}{" "}
        <span className="text-xs font-normal text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
