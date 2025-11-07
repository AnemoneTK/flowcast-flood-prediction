// frontend/src/app/data/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { csv } from "d3-fetch";
import {
  Database,
  FileText,
  Map,
  Server,
  Droplet,
  Wind,
  ShieldAlert,
  Share2,
  ArrowRight,
  Activity,
  AlertTriangle,
  Table,
  BarChart3,
  Grid,
  Thermometer,
  LayoutGrid,
} from "lucide-react";

import {
  // (คอมเมนต์ออก) กราฟ Notebook 04
  // ClusterProfileBarChart,
  // RiskVsDensityScatterPlot,
  // RiskVsPumpReadinessScatterPlot,
  // RainySeasonByClusterBoxPlot,

  // กราฟ Notebook 02 & 06
  RainfallHistogram,
  SeasonalRainBoxPlot,
  FeatureHeatmap,
} from "../components/EdaCharts";

// --- Component กรอบสำหรับ Chart ---
const ChartBox = ({ title, description, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 overflow-x-auto">
      <div className="min-w-[600px] lg:min-w-full">{children}</div>
    </div>
  </div>
);

// --- Component: การ์ดแหล่งข้อมูล (ไม่เปลี่ยนแปลง) ---
const DataSourceCard = ({ title, format, source, icon: Icon, url }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center mb-3">
      <Icon className="w-8 h-8 text-blue-600 mr-3" />
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 mb-1">
      <span className="font-medium">Format:</span> {format}
    </p>
    <p className="text-gray-600">
      <span className="font-medium">Source:</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
        >
          {source}
        </a>
      ) : (
        ` ${source}`
      )}
    </p>
  </div>
);

// --- Component: ขั้นตอน EDA (ไม่เปลี่ยนแปลง) ---
const EdaStep = ({ number, title, description }) => (
  <li className="flex mb-4">
    <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold">
      {number}
    </span>
    <div className="ml-4">
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </li>
);

// --- Component: ตาราง ER Diagram (ไม่เปลี่ยนแปลง) ---
const EREntity = ({ title, attributes, isMain = false }) => {
  const bgColor = isMain ? "bg-blue-600" : "bg-gray-50";
  const titleColor = isMain ? "text-white" : "text-gray-900";
  const borderColor = isMain ? "border-blue-400" : "border-gray-300";

  const getTypeColor = (type) => {
    if (isMain) {
      return "text-yellow-300";
    }
    switch (type) {
      case "PK":
        return "text-yellow-600";
      case "FK":
        return "text-purple-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div
      className={`relative ${bgColor} p-4 rounded-lg shadow-md border ${borderColor} flex flex-col min-h-[180px]`}
    >
      {!isMain && (
        <div className="absolute left-1/2 -ml-[1px] -top-8 h-8 w-0.5 border-l border-dashed border-gray-400"></div>
      )}
      <h5 className={`font-bold ${titleColor} text-center text-base`}>
        {title}
      </h5>
      <hr className={`my-2 ${borderColor}`} />
      <ul className="space-y-1 text-sm flex-grow">
        {attributes.map((attr, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className={`font-semibold ${getTypeColor(attr.type)} mr-2`}>
              {attr.type}
            </span>
            <span
              className={`text-left ${
                isMain ? "text-blue-100" : "text-gray-600"
              }`}
            >
              {attr.desc}
            </span>
            <span
              className={`text-right font-mono ${
                isMain ? "text-blue-100" : "text-gray-500"
              } ml-2`}
            >
              ({attr.name})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Component: ตารางแสดงข้อมูล CSV ---
const DataTableViewer = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    csv("/data/master_features_clustered_seasonal.csv")
      .then((loadedData) => {
        const slicedData = loadedData.slice(0, 50);
        setData(slicedData);
        setHeaders(loadedData.columns);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load CSV for Table Viewer", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="text-center p-10 text-lg text-gray-600">
        กำลังโหลดข้อมูลตาราง...
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="text-center p-10 text-lg text-red-600">
        ไม่สามารถโหลดข้อมูล <code>master_features_clustered_seasonal.csv</code>{" "}
        ได้
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative shadow-md rounded-lg border border-gray-200 max-h-[600px]">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
          <tr>
            {headers.map((header, index) => (
              <th
                key={`${header}-${index}`}
                scope="col"
                className="py-3 px-6 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
              {headers.map((header, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className="py-3 px-6 whitespace-nowrap"
                >
                  {row[header] && row[header].length > 50
                    ? `${row[header].substring(0, 50)}...`
                    : row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Component หลักของหน้า Data ---
export default function DataPage() {
  // (ลบ State ของ Notebook 04 ออก)
  // const [chartData, setChartData] = useState(null);

  // --- State สำหรับกราฟ Notebook 02 & 06 ---
  const [rainfallHistogramData, setRainfallHistogramData] = useState(null);
  const [seasonalBoxData, setSeasonalBoxData] = useState(null);
  const [seasonalBoxGroups, setSeasonalBoxGroups] = useState([]);

  // (*** ลบ State ของ Heatmap ***)
  // const [featureHeatmapData, setFeatureHeatmapData] = useState(null);

  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  useEffect(() => {
    async function loadAllEdaData() {
      try {
        // (*** ลบ URL ของ Heatmap ออก ***)
        const rainDistUrl = "/data/rain_2024_combined_bkk_only.csv";
        const rainSeasonUrl = "/data/rain_2024_with_seasons.csv";

        // (*** ลบ fetchHeatmap ออก ***)

        // (*** ลบ heatJson ออก ***)
        const [rainDistCsv, rainSeasonCsv] = await Promise.all([
          csv(rainDistUrl),
          csv(rainSeasonUrl),
        ]);

        // (ลบโค้ดประมวลผล Notebook 04 ออก)

        // --- ประมวลผลกราฟชุดใหม่ (Notebook 02, 06) ---
        const bins = {
          "0 mm": 0,
          "0.1-10": 0,
          "10.1-30": 0,
          "30.1-60": 0,
          "60+": 0,
        };
        rainDistCsv.forEach((row) => {
          const rain = parseFloat(row["ฝน 24 ชม."]);
          if (isNaN(rain)) return;
          if (rain === 0) bins["0 mm"]++;
          else if (rain <= 10) bins["0.1-10"]++;
          else if (rain <= 30) bins["10.1-30"]++;
          else if (rain <= 60) bins["30.1-60"]++;
          else if (rain > 60) bins["60+"]++;
        });
        const histogramResult = Object.entries(bins).map(([name, count]) => ({
          name,
          count,
        }));
        setRainfallHistogramData(histogramResult);

        const seasons = { Summer: [], Rainy: [], Winter: [] };
        rainSeasonCsv.forEach((row) => {
          const rain = parseFloat(row["ฝน 24 ชม."]);
          if (isNaN(rain) || rain === 0) return;
          if (row.season === "Summer") seasons.Summer.push(rain);
          else if (row.season === "Rainy") seasons.Rainy.push(rain);
          else if (row.season === "Winter") seasons.Winter.push(rain);
        });

        const nivoBoxPlotData = [];
        seasons.Summer.forEach((v) =>
          nivoBoxPlotData.push({ group: "Summer", value: v })
        );
        seasons.Rainy.forEach((v) =>
          nivoBoxPlotData.push({ group: "Rainy", value: v })
        );
        seasons.Winter.forEach((v) =>
          nivoBoxPlotData.push({ group: "Winter", value: v })
        );
        setSeasonalBoxData(nivoBoxPlotData);
        setSeasonalBoxGroups(["Summer", "Rainy", "Winter"]);

        // (*** ลบ setFeatureHeatmapData ออก ***)
      } catch (error) {
        console.error("!!! Failed to load EDA data:", error.message);
      } finally {
        setIsLoadingCharts(false);
      }
    }

    loadAllEdaData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 pt-16">
        {/* --- Header --- */}
        <div className="text-center mb-16">
          <Share2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            ที่มาและการจัดการข้อมูล (Data & Methodology)
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            โปรเจกต์นี้รวบรวมข้อมูลจากหลายแหล่งเพื่อสร้างโปรไฟล์ความเสี่ยงของแต่ละเขตในกรุงเทพฯ
          </p>
        </div>

        {/* --- 1. Data Sources Section --- */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            แหล่งข้อมูล (Data Sources)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DataSourceCard
              title="ขอบเขต 50 เขต (Districts)"
              format="Shapefile (.zip)"
              source="data.bangkok.go.th"
              icon={Map}
              url="https://data.bangkok.go.th/dataset/e537025b-1cf6-4c5b-8e46-c2e976f13283/resource/d7be7e84-9d84-4595-bf8f-79b0bc01f1ae/download/district-2.zip"
            />
            <DataSourceCard
              title="จุดอ่อนน้ำท่วม (Flood Points)"
              format="Shapefile (.zip)"
              source="data.bangkok.go.th"
              icon={Droplet}
              url="https://data.bangkok.go.th/dataset/36256cdf-5576-4b17-9c4a-ddde6c7ff343/resource/b8f2058d-e562-421e-a4cf-1dd706c3ba8a/download/flood_point.zip"
            />
            <DataSourceCard
              title="ประตูระบายน้ำ (Flood Gates)"
              format="Shapefile (.zip)"
              source="data.bangkok.go.th"
              icon={ShieldAlert}
              url="https://data.bangkok.go.th/dataset/83ae5639-a37f-4e19-bd37-e1c97930f39d/resource/9ce9a608-c25c-49cc-80aa-4145f08effbf/download/floodgate.zip"
            />
            <DataSourceCard
              title="ข้อมูลคลอง (Canals)"
              format="Excel Report (.xls)"
              source="dds.bangkok.go.th"
              icon={FileText}
              url="https://dds.bangkok.go.th/public_content/files/001/0005003_1.xls"
            />
            <DataSourceCard
              title="ความพร้อมเครื่องสูบน้ำ"
              format="CSV"
              source="data.bangkok.go.th"
              icon={Server}
              url="https://data.bangkok.go.th/dataset/05b576a3-c2b1-4f03-8b1f-24104d208c1d/resource/a68f0b2d-2a0b-4694-ac1c-91da29c81853/download/5.-.csv"
            />
            <DataSourceCard
              title="ข้อมูลฝน (Rainfall)"
              format="API (JSON)"
              source="data.bangkok.go.th (via API)"
              icon={Activity}
              url="https://data.bangkok.go.th/dataset/rainfall"
            />
            <DataSourceCard
              title="ข้อมูลความเสี่ยง (Risk)"
              format="PDF (OCR)"
              source="รายงานสรุปเหตุการณ์ฯ ปี 2560"
              icon={AlertTriangle}
              url={null}
            />
            <DataSourceCard
              title="สถานีสูบน้ำ (Pump Stations)"
              format="Shapefile (.zip)"
              source="data.bangkok.go.th"
              icon={Wind}
              url="https://data.bangkok.go.th/dataset/82cb9fcc-ddea-436a-abfa-eb5dc9fc85fc/resource/739e6a23-3aa7-4b84-bbfb-bc8fd7cd692b/download/pump_sta.zip"
            />
            <DataSourceCard
              title="กลุ่มเขต (BMA Zones)"
              format="Shapefile (.zip)"
              source="data.bangkok.go.th"
              icon={Map}
              url="https://data.bangkok.go.th/dataset/6ff6277d-e945-4bec-a2e7-4ecee59526fd/resource/988a7284-7f2d-4b59-8a09-c262f1a03f46/download/bma_zone.zip"
            />
          </div>
        </section>

        {/* --- 2. EDA & Preparation Section --- */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            การสำรวจและเตรียมข้อมูล (EDA)
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                แผนผังความสัมพันธ์ข้อมูล (ER Diagram)
              </h3>
              <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
                ข้อมูลทั้งหมดถูกเชื่อมโยง (Join) เข้ากับตารางหลัก{" "}
                <strong>&ldquo;Districts&rdquo;</strong> โดยใช้คีย์ `dcode`
                (รหัสเขต) หรือ `dname` (ชื่อเขต) เพื่อสร้าง Master Table
              </p>
              <div className="flex flex-col items-center">
                <div className="w-full md:w-3/4 lg:w-1/2">
                  <EREntity
                    title="Districts (ตารางเขต)"
                    isMain={true}
                    attributes={[
                      { name: "dcode", desc: "รหัสเขต", type: "PK" },
                      { name: "dname", desc: "ชื่อเขต", type: "PK" },
                      { name: "AREA", desc: "พื้นที่ (ตร.ม.)", type: "Attr" },
                      { name: "population", desc: "ประชากร", type: "Attr" },
                      { name: "geometry", desc: "ข้อมูลพิกัด", type: "Attr" },
                    ]}
                  />
                </div>
                <div className="relative w-full h-20">
                  <div className="absolute left-1/2 -ml-[1px] top-0 h-8 w-0.5 border-l border-dashed border-gray-400"></div>
                  <div className="absolute left-[2.5%] top-8 h-0.5 w-[95%] border-t border-dashed border-gray-400"></div>
                </div>
                <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 w-full">
                  <EREntity
                    title="Flood Points"
                    attributes={[
                      { name: "id_flood", desc: "ID จุดน้ำท่วม", type: "PK" },
                      { name: "dcode", desc: "รหัสเขต", type: "FK" },
                      { name: "location", desc: "ที่ตั้ง", type: "Attr" },
                    ]}
                  />
                  <EREntity
                    title="Flood Gates"
                    attributes={[
                      { name: "id_flood", desc: "ID ประตูน้ำ", type: "PK" },
                      { name: "dcode", desc: "รหัสเขต", type: "FK" },
                      { name: "name", desc: "ชื่อประตูน้ำ", type: "Attr" },
                    ]}
                  />
                  <EREntity
                    title="Canals (ข้อมูลคลอง)"
                    attributes={[
                      { name: "ชื่อคลอง", desc: "ชื่อคลอง", type: "PK" },
                      { name: "dcode", desc: "รหัสเขต", type: "FK" },
                      { name: "dname", desc: "ชื่อเขต", type: "FK" },
                    ]}
                  />
                  <EREntity
                    title="Pump Readiness"
                    attributes={[
                      { name: "dcode", desc: "รหัสเขต", type: "FK" },
                      { name: "pump_number", desc: "จำนวนปั๊ม", type: "Attr" },
                      {
                        name: "pump_ready",
                        desc: "ปั๊มที่พร้อม",
                        type: "Attr",
                      },
                    ]}
                  />
                  <EREntity
                    title="Risk Data (ข้อมูลเสี่ยง)"
                    attributes={[
                      { name: "dcode", desc: "รหัสเขต", type: "FK" },
                      { name: "Ranking", desc: "อันดับเสี่ยง", type: "Attr" },
                      { name: "คะแนนรวม", desc: "คะแนนเสี่ยง", type: "Attr" },
                    ]}
                  />
                  <EREntity
                    title="Rainfall (ข้อมูลฝน)"
                    attributes={[
                      { name: "dcode", desc: "รหัสเขต", type: "FK" },
                      { name: "รหัสสถานี", desc: "ID สถานีฝน", type: "Attr" },
                      { name: "ฝน 24 ชม.", desc: "ฝนสะสม 24ชม.", type: "Attr" },
                    ]}
                  />
                  <EREntity
                    title="BMA Zones (กลุ่มเขต)"
                    attributes={[
                      { name: "z_code", desc: "รหัสกลุ่มเขต", type: "PK" },
                      { name: "geometry", desc: "ข้อมูลพิกัด", type: "Attr" },
                      { name: "Join Type", desc: "Spatial Join", type: "FK" },
                    ]}
                  />
                  <EREntity
                    title="Pump Stations"
                    attributes={[
                      { name: "pump_id", desc: "ID สถานีสูบ", type: "PK" },
                      { name: "dcode", desc: "รหัสเขต", type: "FK" },
                      { name: "name", desc: "ชื่อสถานี", type: "Attr" },
                    ]}
                  />
                </div>
              </div>
            </div>

            <hr className="my-12" />

            {/* --- EDA Steps --- */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              ขั้นตอนการเตรียมข้อมูล
            </h3>
            <ul className="list-none">
              <EdaStep
                number="1"
                title="การรวบรวมและถอดรหัส (Collection & Encoding)"
                description="ดึงข้อมูลจาก BMA Data Portal และ API อื่นๆ พบว่าไฟล์ Shapefile ส่วนใหญ่ใช้การเข้ารหัสแบบ 'TIS-620' ในขณะที่ไฟล์ CSV ใหม่ๆ ใช้ 'utf-8' จึงต้องมีการกำหนดค่า encoding ให้ถูกต้อง"
              />
              <EdaStep
                number="2"
                title="การเชื่อมโยงเชิงพื้นที่ (Spatial Joins)"
                description="ใช้ GeoPandas เพื่อนับจำนวน &ldquo;จุด&rdquo; (เช่น จุดอ่อนน้ำท่วม, สถานีสูบน้ำ) ว่าตกอยู่ใน &ldquo;พื้นที่&rdquo; (ขอบเขต 50 เขต) ใดบ้าง โดยใช้คำสั่ง sjoin"
              />
              <EdaStep
                number="3"
                title="การรวบรวมและรวมตาราง (Aggregation & Merge)"
                description="ข้อมูลบางอย่าง (เช่น ข้อมูลคลอง, ข้อมูลฝน) ถูกรวบรวม (groupby) ตามคีย์เขต ('dcode' หรือ 'dname') เพื่อสรุปยอด (เช่น นับจำนวน, รวมความยาว, หาค่าเฉลี่ย) ก่อนนำไปรวม (merge) กับตารางเขตหลัก"
              />
              <EdaStep
                number="4"
                title="การสร้างฟีเจอร์ใหม่ (Feature Engineering)"
                description="สร้างตัวแปรใหม่ๆ ที่มีความหมายมากขึ้น เช่น 'ความหนาแน่นของประชากร' (จากการนำจำนวนประชากรมาหารด้วยพื้นที่) หรือ 'อัตราส่วนความพร้อมของปั๊ม' (นำปั๊มที่พร้อมใช้หารด้วยปั๊มทั้งหมด)"
              />
              <EdaStep
                number="5"
                title="การสำรวจด้วยภาพ (Visualization)"
                description="ทำการพล็อตแผนที่เขต, พล็อตจุดอ่อนน้ำท่วมลงบนแผนที่, และสร้าง Heatmap (แผนที่ความร้อน) เพื่อดูความสัมพันธ์ระหว่างตัวแปรต่างๆ (Correlation Matrix) ก่อนนำไปเข้าโมเดล"
              />
            </ul>
          </div>
        </section>

        {/* --- 3. Data Table Section --- */}
        <section className="mb-16">
          <div className="flex justify-center items-center gap-4 mb-8">
            <Table className="w-10 h-10 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              ตารางข้อมูล (Data Table)
            </h2>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            {/* <p className="text-lg text-gray-700 mb-6 text-center">
              ตารางข้อมูลจากไฟล์{" "}
              <code>master_features_clustered_seasonal.csv</code> (แสดง 50
              แถวแรก)
            </p> */}
            <DataTableViewer />
          </div>
        </section>

        {/* --- 4. EDA Visualization Section (Notebook 02, 06) --- */}
        <section className="mb-16">
          <div className="flex justify-center items-center gap-4 mb-8">
            <Droplet className="w-10 h-10 text-cyan-600" />
            <Thermometer className="w-10 h-10 text-red-600" />
            <LayoutGrid className="w-10 h-10 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              การวิเคราะห์ข้อมูลฝนและปัจจัย
            </h2>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            {isLoadingCharts && (
              <div className="text-center p-20 text-lg text-gray-600">
                กำลังโหลดข้อมูลกราฟ...
              </div>
            )}

            {/* กราฟที่ 1 & 2 (ฝน) */}
            {!isLoadingCharts && rainfallHistogramData && seasonalBoxData && (
              <div className="space-y-8">
                <ChartBox
                  title="การกระจายตัวของฝน (Rainfall Distribution)"
                  description="แสดงปัญหา Zero-Inflated ข้อมูลส่วนใหญ่ (90%+) คือ 'ฝน = 0' ซึ่งเป็นสาเหตุที่โมเดลพยากรณ์ล้มเหลว"
                >
                  <RainfallHistogram data={rainfallHistogramData} />
                </ChartBox>
                <ChartBox
                  title="ปริมาณฝนตามฤดูกาล (Rainfall by Season)"
                  description="ยืนยัน Insight สำคัญ: 'ฤดูร้อน' (Summer) มีวันที่ฝนตกหนักสุดขีด (Outliers) มากกว่า 'ฤดูฝน' (Rainy) (กราฟนี้แสดงเฉพาะวันที่ฝน > 0)"
                >
                  <SeasonalRainBoxPlot
                    data={seasonalBoxData}
                    groups={seasonalBoxGroups}
                  />
                </ChartBox>
              </div>
            )}

            {/* กราฟที่ 3 (Heatmap) */}
            {/* (*** แก้ไข: เรียก <FeatureHeatmap /> โดยตรง ***) */}
            {!isLoadingCharts && (
              <div className="space-y-8 mt-8">
                <ChartBox
                  title="ความสัมพันธ์ของปัจจัยเสี่ยง (Feature Correlation)"
                  // description="แสดงให้เห็นว่าปัจจัยต่างๆ สัมพันธ์กันหรือไม่ (ค่าเข้าใกล้ 1 หรือ -1) เช่น พื้นที่ (Area) ที่เยอะ อาจจะสัมพันธ์กับการมีปั๊ม (Pumps) เยอะตามไปด้วย"
                >
                  <FeatureHeatmap />
                </ChartBox>
              </div>
            )}

            {/* ข้อความ Error รวม (หากโหลดไฟล์หลักๆ ไม่ได้) */}
            {!isLoadingCharts &&
              (!rainfallHistogramData || !seasonalBoxData) && (
                <div className="text-center p-10 text-lg text-red-600">
                  ไม่สามารถโหลดข้อมูลสำหรับกราฟวิเคราะห์ข้อมูลฝนได้
                  (โปรดตรวจสอบไฟล์ rain_... .csv ใน /public/data)
                </div>
              )}
          </div>
        </section>
      </div>{" "}
      {/* --- จบส่วนเนื้อหาหลัก --- */}
      <div className="container mx-auto px-4 pt-16 pb-16 text-center mt-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
        >
          ไปที่หน้า Interactive Dashboard
        </Link>
      </div>
    </div>
  );
}
