// src/app/components/InteractiveMap.js
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Icons
const iconFix = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};
iconFix();

function MapUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

// รับ onSelect มาเพื่อใช้ตอนกดปุ่มใน Popup
export default function InteractiveMap({ selectedDcode, onSelect }) {
  const [mapData, setMapData] = useState({ districts: null, riskPoints: null });
  const [loading, setLoading] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);

  // Function สำหรับจัดการคลิกปุ่มใน Popup (ต้องใช้ window object เพราะอยู่ใน string HTML)
  useEffect(() => {
    window.handleDistrictSelect = (dcode) => {
      if (onSelect) onSelect(dcode);
    };
  }, [onSelect]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/geo/map-data");
        const json = await res.json();
        if (res.ok) setMapData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDcode && selectedDcode !== "all" && mapData.districts) {
      const feature = mapData.districts.features.find(
        (f) => String(f.properties.dcode) === String(selectedDcode)
      );
      if (feature) {
        const layer = L.geoJSON(feature);
        setMapBounds(layer.getBounds());
      }
    } else {
      setMapBounds(L.latLngBounds([13.45, 100.35], [13.95, 100.95]));
    }
  }, [selectedDcode, mapData.districts]);

  const districtStyle = (feature) => {
    const isSelected =
      String(feature.properties.dcode) === String(selectedDcode);
    // สีตาม Cluster: 0=เขียว, 1=เหลือง, 2=แดง (ถ้าไม่มีค่าให้เป็นเทา)
    const clusterColor =
      feature.properties.cluster === 2
        ? "#ef4444"
        : feature.properties.cluster === 1
        ? "#eab308"
        : feature.properties.cluster === 0
        ? "#10b981"
        : "#cbd5e1";

    return {
      fillColor: isSelected ? "#3b82f6" : clusterColor,
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: "white",
      fillOpacity: isSelected ? 0.6 : 0.5,
    };
  };

  const onEachDistrict = (feature, layer) => {
    const { dname, dcode, cluster, riskLevel, flood_count } =
      feature.properties;

    // HTML สำหรับ Popup (จัดสไตล์ด้วย Tailwind class พื้นฐาน หรือ inline style)
    const popupContent = `
      <div style="min-width: 200px; text-align: center;">
        <h3 style="font-weight:bold; font-size:1.1em; margin-bottom:5px;">${dname}</h3>
        <div style="margin-bottom: 10px; font-size: 0.9em; color: #555;">
          <span style="background:#f3f4f6; padding: 2px 6px; border-radius:4px;">Cluster ${cluster}</span>
          <span style="margin-left:5px;">เสี่ยง: ${riskLevel}</span>
        </div>
        <p style="font-size:0.8em; margin-bottom:10px;">ประวัติน้ำท่วม: ${flood_count} ครั้ง</p>
        <button 
          onclick="window.handleDistrictSelect('${dcode}')"
          style="background-color: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9em; width: 100%;">
          ดูรายละเอียด
        </button>
      </div>
    `;
    layer.bindPopup(popupContent);

    // Hover Effect
    layer.on("mouseover", (e) => {
      e.target.setStyle({ fillOpacity: 0.8, weight: 2 });
    });
    layer.on("mouseout", (e) => {
      const isSelected = String(dcode) === String(selectedDcode);
      e.target.setStyle({
        fillOpacity: isSelected ? 0.6 : 0.5,
        weight: isSelected ? 3 : 1,
      });
    });
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        กำลังโหลดแผนที่...
      </div>
    );

  return (
    <MapContainer
      center={[13.7563, 100.5018]}
      zoom={10}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mapData.districts && (
        <GeoJSON
          data={mapData.districts}
          style={districtStyle}
          onEachFeature={onEachDistrict}
        />
      )}

      {/* แก้ไข Logic การแสดงจุดเสี่ยง: ถ้าเลือก all หรือ null ให้โชว์หมด */}
      {mapData.riskPoints &&
        mapData.riskPoints.features.map((point, idx) => {
          // ถ้ามีการเลือกเขต (ที่ไม่ใช่ all) ให้กรองจุดเฉพาะเขตนั้น
          if (
            selectedDcode &&
            selectedDcode !== "all" &&
            String(point.properties.dcode) !== String(selectedDcode)
          ) {
            return null;
          }

          const position = [
            point.geometry.coordinates[1],
            point.geometry.coordinates[0],
          ];
          return (
            <CircleMarker
              key={idx}
              center={position}
              radius={5}
              pathOptions={{
                color: "white",
                weight: 1,
                fillColor: "#dc2626",
                fillOpacity: 0.9,
              }}
            >
              <Popup>{point.properties.name}</Popup>
            </CircleMarker>
          );
        })}

      <MapUpdater bounds={mapBounds} />
    </MapContainer>
  );
}
