// frontend/src/app/components/InteractiveMap.js
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import สำหรับ Leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);
const LayersControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl),
  { ssr: false }
);
const LayersControlOverlay = dynamic(
  () => import("react-leaflet").then((mod) => mod.LayersControl.Overlay),
  { ssr: false }
);

export default function InteractiveMap({ selectedDcode }) {
  const [L, setL] = useState(null);
  const [leafletIcons, setLeafletIcons] = useState(null);
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const [floodPointsGeoJson, setFloodPointsGeoJson] = useState(null);
  const [floodgatesGeoJson, setFloodgatesGeoJson] = useState(null);

  // Effect สำหรับโหลด Leaflet และตั้งค่า Icons
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      const LeafletModule = leaflet.default;
      setL(LeafletModule);

      // 1. แก้บั๊ก iconUrl ของ Leaflet
      delete LeafletModule.Icon.Default.prototype._getIconUrl;
      LeafletModule.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // 2. สร้าง Icon สีแดง
      const redIcon = new LeafletModule.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // 3. เก็บ Icons ที่สร้างเสร็จแล้วลง State
      setLeafletIcons({
        default: LeafletModule.Icon.Default,
        red: redIcon,
      });
    });
  }, []);

  // โหลดขอบเขตเขต (Polygons)
  useEffect(() => {
    fetch("/api/geo/districts")
      .then((res) => res.json())
      .then((data) => setDistrictGeoJson(data))
      .catch((err) => console.error("Failed to load district geometry:", err));
  }, []);

  // โหลดจุดเสี่ยง (Points)
  useEffect(() => {
    fetch("/api/geo/floodpoints")
      .then((res) => res.json())
      .then((data) => setFloodPointsGeoJson(data))
      .catch((err) => console.error("Failed to load flood points:", err));
  }, []);

  // โหลดประตูน้ำ (Points)
  useEffect(() => {
    fetch("/api/geo/floodgates")
      .then((res) => res.json())
      .then((data) => setFloodgatesGeoJson(data))
      .catch((err) => console.error("Failed to load floodgates:", err));
  }, []);

  // ฟังก์ชันสำหรับกรองข้อมูล
  const filterByDcode = (geojson, dcode) => {
    if (dcode === "all" || !geojson) return geojson;

    const filteredFeatures = geojson.features.filter(
      (feature) => feature.properties.dcode == dcode
    );
    return { type: "FeatureCollection", features: filteredFeatures };
  };

  // ใช้ useMemo เพื่อคำนวณข้อมูลที่จะแสดงผลใหม่
  const filteredDistricts = useMemo(
    () => filterByDcode(districtGeoJson, selectedDcode),
    [districtGeoJson, selectedDcode]
  );
  const filteredFloodPoints = useMemo(
    () => filterByDcode(floodPointsGeoJson, selectedDcode),
    [floodPointsGeoJson, selectedDcode]
  );
  const filteredFloodgates = useMemo(
    () => filterByDcode(floodgatesGeoJson, selectedDcode),
    [floodgatesGeoJson, selectedDcode]
  );

  // สไตล์สำหรับ Polygon
  const districtStyle = {
    color: "#3388ff",
    weight: 2,
    opacity: 0.7,
    fillOpacity: 0.1,
  };

  // ถ้า Leaflet หรือ Icons ยังไม่พร้อม ให้แสดง Loading
  if (!L || !leafletIcons) {
    return (
      <div
        style={{ height: "500px", width: "100%", zIndex: 10 }}
        className="flex items-center justify-center bg-gray-100 text-gray-500"
      >
        กำลังเตรียมแผนที่...
      </div>
    );
  }

  // ขอบเขตกรุงเทพ
  const bangkokBounds = L.latLngBounds([13.45, 100.35], [13.95, 100.95]);

  // ถ้าพร้อมแล้ว ค่อย Render MapContainer
  return (
    <MapContainer
      center={[13.736717, 100.523186]}
      zoom={11}
      style={{ height: "500px", width: "100%", zIndex: 10 }}
      maxBounds={bangkokBounds}
      minZoom={10}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <LayersControl position="topright">
        {filteredDistricts && (
          <LayersControlOverlay checked name="ขอบเขตเขต">
            <GeoJSON
              key={selectedDcode + "_districts"}
              data={filteredDistricts}
              style={districtStyle}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.dname) {
                  layer.bindPopup(feature.properties.dname);
                }
              }}
            />
          </LayersControlOverlay>
        )}

        {filteredFloodPoints && (
          <LayersControlOverlay checked name="จุดเสี่ยงน้ำท่วม">
            <GeoJSON
              key={selectedDcode + "_floodpoints"}
              data={filteredFloodPoints}
              pointToLayer={(feature, latlng) => {
                return L.marker(latlng, { icon: leafletIcons.red });
              }}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
          </LayersControlOverlay>
        )}

        {filteredFloodgates && (
          <LayersControlOverlay name="ประตูน้ำ">
            <GeoJSON
              key={selectedDcode + "_floodgates"}
              data={filteredFloodgates}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
          </LayersControlOverlay>
        )}
      </LayersControl>
    </MapContainer>
  );
}
