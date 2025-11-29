// frontend/src/app/components/InteractiveMap.js
"use client";
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Layers } from "lucide-react";

// Component ช่วยจัด Zoom/Pan
function MapUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function InteractiveMap({ selectedDcode, onSelect }) {
  const [mapData, setMapData] = useState({
    districts: null,
    riskPoints: null,
    pumps: null,
  });
  const [mapBounds, setMapBounds] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState(null);

  // ตัวแปรเก็บค่า Select Box (default: แสดงทั้งหมด)
  const [activeLayer, setActiveLayer] = useState("all");

  // 1. Init Leaflet
  useEffect(() => {
    (async () => {
      const leaflet = (await import("leaflet")).default;
      setL(leaflet);
      // Fix Icons Leaflet
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      setIsMounted(true);
    })();
  }, []);

  // 2. Load Data
  useEffect(() => {
    fetch("/api/geo/map-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.districts) {
          setMapData(data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // 3. Handle Popup Click
  useEffect(() => {
    window.handleDistrictSelect = (dcode) => {
      if (onSelect) onSelect(dcode);
    };
  }, [onSelect]);

  // 4. Focus Map
  useEffect(() => {
    if (!L || !mapData.districts) return;
    if (selectedDcode && selectedDcode !== "all") {
      const feature = mapData.districts.features.find(
        (f) => String(f.properties.dcode) === String(selectedDcode)
      );
      if (feature) {
        const layer = L.geoJSON(feature);
        setMapBounds(layer.getBounds());
      }
    } else {
      // มุมกล้องเริ่มต้น (กรุงเทพฯ)
      setMapBounds(L.latLngBounds([13.5, 100.35], [13.95, 100.95]));
    }
  }, [selectedDcode, mapData.districts, L]);

  // --- Styles & Color Logic ---
  const districtStyle = (feature) => {
    const isSelected =
      String(feature.properties.dcode) === String(selectedDcode);
    // แปลง cluster เป็น String เผื่อ API ส่งมาเป็น int หรือ string
    const cluster = String(feature.properties.cluster);

    let color = "#94a3b8"; // สีเทา Default (ถ้าไม่มีข้อมูล)

    // กำหนดสีตามกลุ่มเสี่ยง (K-Means Clusters)
    if (cluster === "1") color = "#ef4444"; // High Risk (แดง)
    else if (cluster === "2") color = "#eab308"; // Watch (เหลือง)
    else if (cluster === "0") color = "#10b981"; // Low Risk (เขียว)

    return {
      fillColor: isSelected ? "#3b82f6" : color, // ถ้าเลือกอยู่ให้เป็นสีฟ้า
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: "white",
      fillOpacity: isSelected ? 0.7 : 0.5,
    };
  };

  const onEachDistrict = (feature, layer) => {
    const { dname, dcode, cluster, flood_count } = feature.properties;
    const popupContent = `
      <div class="text-center min-w-[160px] font-sans">
        <h3 class="font-bold text-lg mb-1 text-slate-800">${dname}</h3>
        <div class="mb-2">
          <span class="px-2 py-1 rounded text-xs text-white bg-slate-500">
             Cluster ${cluster}
          </span>
        </div>
        <p class="text-xs text-gray-500 mb-3">จุดเสี่ยงน้ำท่วม: ${flood_count} จุด</p>
        <button 
          onclick="window.handleDistrictSelect('${dcode}')"
          class="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs hover:bg-blue-700 transition w-full cursor-pointer"
        >
          ดูรายละเอียดเขตนี้
        </button>
      </div>
    `;
    layer.bindPopup(popupContent);

    layer.on("mouseover", (e) =>
      e.target.setStyle({ fillOpacity: 0.8, weight: 2 })
    );
    layer.on("mouseout", (e) => {
      const isSelected = String(dcode) === String(selectedDcode);
      e.target.setStyle({
        fillOpacity: isSelected ? 0.7 : 0.5,
        weight: isSelected ? 3 : 1,
      });
    });
  };

  if (!isMounted)
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400 animate-pulse rounded-2xl">
        กำลังโหลดแผนที่...
      </div>
    );

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      {/* --- SELECT BOX MENU (มุมขวาบน) --- */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2">
        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
          <Layers size={18} />
        </div>
        <select
          value={activeLayer}
          onChange={(e) => setActiveLayer(e.target.value)}
          className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer font-medium min-w-[130px]"
        >
          <option value="all">แสดงทั้งหมด</option>
          <option value="risk">⚠️ จุดเสี่ยงน้ำท่วม</option>
          {/* <option value="pump">💧 สถานีสูบน้ำ</option> */}
          <option value="none">ซ่อนจุด (ดูเฉพาะสีเขต)</option>
        </select>
      </div>

      {/* --- MAP --- */}
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={10}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false} // ปิด Zoom เดิม (Optional)
      >
        {/* ใช้แผนที่โทนสว่างเพื่อให้สีเขตชัดเจน */}
        <TileLayer
          attribution="&copy; CartoDB"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* 1. District Layer */}
        {mapData.districts && (
          <GeoJSON
            // ใช้ key เพื่อบังคับ re-render เมื่อเลือกเขต หรือข้อมูลเปลี่ยน
            key={`districts-${selectedDcode}-${
              mapData.districts ? "loaded" : "loading"
            }`}
            data={mapData.districts}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        )}

        {/* 2. Risk Points Layer (สีแดง) */}
        {(activeLayer === "all" || activeLayer === "risk") &&
          mapData.riskPoints &&
          mapData.riskPoints.features.map((point, idx) => {
            // ซ่อนถ้าไม่ได้เลือกเขตนี้ (และไม่ได้เลือกดู all districts)
            if (
              selectedDcode &&
              selectedDcode !== "all" &&
              String(point.properties.dcode) !== String(selectedDcode)
            )
              return null;

            return (
              <CircleMarker
                key={`risk-${idx}`}
                center={[
                  point.geometry.coordinates[1],
                  point.geometry.coordinates[0],
                ]}
                radius={5}
                pathOptions={{
                  color: "white",
                  weight: 1,
                  fillColor: "#ef4444",
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <div className="text-center text-sm">
                    <strong className="text-red-600 flex items-center justify-center gap-1">
                      ⚠️ จุดเสี่ยง
                    </strong>
                    <p className="text-slate-600 mt-1">
                      {point.properties.name}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* 3. Pump Stations Layer (สีฟ้า) */}
        {(activeLayer === "all" || activeLayer === "pump") &&
          mapData.pumps &&
          mapData.pumps.features.map((pump, idx) => {
            if (
              selectedDcode &&
              selectedDcode !== "all" &&
              String(pump.properties.dcode) !== String(selectedDcode)
            )
              return null;
            if (!pump.geometry || !pump.geometry.coordinates) return null;

            return (
              <CircleMarker
                key={`pump-${idx}`}
                center={[
                  pump.geometry.coordinates[1],
                  pump.geometry.coordinates[0],
                ]}
                radius={4}
                pathOptions={{
                  color: "white",
                  weight: 1,
                  fillColor: "#3b82f6",
                  fillOpacity: 0.8,
                }}
              >
                {/* <Popup>
                  <div className="text-center text-sm">
                    <strong className="text-blue-600 flex items-center justify-center gap-1">
                      💧 สถานีสูบน้ำ
                    </strong>
                    <p className="text-slate-600 mt-1">
                      {pump.properties.name}
                    </p>
                  </div>
                </Popup> */}
              </CircleMarker>
            );
          })}

        <MapUpdater bounds={mapBounds} />
      </MapContainer>
    </div>
  );
}
