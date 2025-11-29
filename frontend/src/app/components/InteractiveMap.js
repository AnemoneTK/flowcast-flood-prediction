// src/app/components/InteractiveMap.js
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

// Component สำหรับสั่ง Zoom/Pan แผนที่
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
  const [mapData, setMapData] = useState({ districts: null, riskPoints: null });
  const [mapBounds, setMapBounds] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState(null);

  // 1. Init Leaflet (โหลดครั้งเดียว)
  useEffect(() => {
    (async () => {
      const leaflet = (await import("leaflet")).default;
      setL(leaflet);

      // Fix Icons
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

  // 2. Load API Data
  useEffect(() => {
    fetch("/api/geo/map-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.districts) setMapData(data);
      })
      .catch((e) => console.error(e));
  }, []);

  // 3. Handle Popup Button Click
  useEffect(() => {
    window.handleDistrictSelect = (dcode) => {
      if (onSelect) onSelect(dcode);
    };
  }, [onSelect]);

  // 4. Calculate Bounds (เปลี่ยนมุมกล้องเมื่อ selectedDcode เปลี่ยน)
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
      // Default Bangkok View
      setMapBounds(L.latLngBounds([13.45, 100.35], [13.95, 100.95]));
    }
  }, [selectedDcode, mapData.districts, L]);

  // Styles
  const districtStyle = (feature) => {
    const isSelected =
      String(feature.properties.dcode) === String(selectedDcode);
    const cluster = feature.properties.cluster;

    let color = "#cbd5e1";
    if (cluster === 1) color = "#ef4444"; // High Risk
    else if (cluster === 2) color = "#eab308"; // Watch
    else if (cluster === 0) color = "#10b981"; // Low Risk

    return {
      fillColor: isSelected ? "#3b82f6" : color,
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: "white",
      fillOpacity: isSelected ? 0.6 : 0.5,
    };
  };

  const onEachDistrict = (feature, layer) => {
    const { dname, dcode, cluster, flood_count } = feature.properties;
    const popupContent = `
      <div class="text-center min-w-[150px]">
        <h3 class="font-bold text-lg mb-1">${dname}</h3>
        <div class="mb-2">
          <span class="px-2 py-1 rounded text-xs text-white ${
            cluster === 1
              ? "bg-red-500"
              : cluster === 2
              ? "bg-yellow-500"
              : "bg-green-500"
          }">Cluster ${cluster}</span>
        </div>
        <p class="text-xs text-gray-500 mb-2">ประวัติน้ำท่วม: ${flood_count} ครั้ง</p>
        <button 
          onclick="window.handleDistrictSelect('${dcode}')"
          class="bg-blue-500 text-white px-3 py-1 rounded text-sm w-full hover:bg-blue-600 transition"
        >
          ดูรายละเอียด
        </button>
      </div>
    `;
    layer.bindPopup(popupContent);

    layer.on("mouseover", (e) => e.target.setStyle({ fillOpacity: 0.8 }));
    layer.on("mouseout", (e) => {
      const isSelected = String(dcode) === String(selectedDcode);
      e.target.setStyle({ fillOpacity: isSelected ? 0.6 : 0.5 });
    });
  };

  if (!isMounted)
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        กำลังโหลดแผนที่...
      </div>
    );

  return (
    <MapContainer
      // ⚠️ ไม่ใส่ id และ key ที่นี่ เพื่อไม่ให้มัน Re-mount บ่อยๆ
      center={[13.7563, 100.5018]}
      zoom={10}
      style={{ height: "100%", width: "100%", borderRadius: "1rem", zIndex: 0 }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ใส่ key ที่ GeoJSON แทน เพื่อให้มันวาดใหม่เมื่อข้อมูลเปลี่ยน */}
      {mapData.districts && (
        <GeoJSON
          key={`districts-${selectedDcode}`} // Re-render เฉพาะ Layer นี้เมื่อเลือกเขต
          data={mapData.districts}
          style={districtStyle}
          onEachFeature={onEachDistrict}
        />
      )}

      {mapData.riskPoints &&
        mapData.riskPoints.features.map((point, idx) => {
          if (
            selectedDcode &&
            selectedDcode !== "all" &&
            String(point.properties.dcode) !== String(selectedDcode)
          ) {
            return null;
          }
          const pos = [
            point.geometry.coordinates[1],
            point.geometry.coordinates[0],
          ];
          return (
            <CircleMarker
              key={idx}
              center={pos}
              radius={4}
              pathOptions={{
                color: "white",
                weight: 1,
                fillColor: "#dc2626",
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="text-center">
                  <b className="text-red-600">จุดเสี่ยงน้ำท่วม</b>
                  <br />
                  {point.properties.name}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      <MapUpdater bounds={mapBounds} />
    </MapContainer>
  );
}
