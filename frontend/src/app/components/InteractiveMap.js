// frontend/src/app/components/InteractiveMap.js
"use client";

import { useState, useEffect, useMemo } from "react"; // (ปรับแก้) เพิ่ม useMemo
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// (แก้บั๊ก iconUrl)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ไอคอนสีแดงสำหรับ "จุดเสี่ยง"
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// (แก้บั๊ก ล็อกแผนที่) ขอบเขตกรุงเทพสำหรับล็อกแผนที่ (WGS84 Lat/Lon)
// ต้องใช้ L.latLngBounds()
const bangkokBounds = L.latLngBounds(
  [13.45, 100.35], // มุมตะวันตกเฉียงใต้
  [13.95, 100.95] // มุมตะวันออกเฉียงเหนือ
);

// (ปรับแก้) รับ selectedDcode เข้ามา
export default function InteractiveMap({ selectedDcode }) {
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const [floodPointsGeoJson, setFloodPointsGeoJson] = useState(null);
  const [floodgatesGeoJson, setFloodgatesGeoJson] = useState(null);

  // 1. โหลดขอบเขตเขต (Polygons) - โหลดครั้งเดียว
  useEffect(() => {
    fetch("/api/geo/districts")
      .then((res) => res.json())
      .then((data) => setDistrictGeoJson(data))
      .catch((err) => console.error("Failed to load district geometry:", err));
  }, []);

  // 2. โหลดจุดเสี่ยง (Points) - โหลดครั้งเดียว
  useEffect(() => {
    fetch("/api/geo/floodpoints")
      .then((res) => res.json())
      .then((data) => setFloodPointsGeoJson(data))
      .catch((err) => console.error("Failed to load flood points:", err));
  }, []);

  // 3. โหลดประตูน้ำ (Points) - โหลดครั้งเดียว
  useEffect(() => {
    fetch("/api/geo/floodgates")
      .then((res) => res.json())
      .then((data) => setFloodgatesGeoJson(data))
      .catch((err) => console.error("Failed to load floodgates:", err));
  }, []);

  // (ใหม่) ฟังก์ชันสำหรับกรองข้อมูล
  const filterByDcode = (geojson, dcode) => {
    if (dcode === "all" || !geojson) return geojson; // ถ้าเลือก "ทุกเขต"

    // ถ้าเลือกเขตเดียว
    const filteredFeatures = geojson.features.filter(
      (feature) => feature.properties.dcode == dcode // ใช้ == เพื่อเทียบ string/number
    );
    return { type: "FeatureCollection", features: filteredFeatures };
  };

  // (ใหม่) ใช้ useMemo เพื่อคำนวณข้อมูลที่จะแสดงผลใหม่
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

  return (
    <MapContainer
      center={[13.736717, 100.523186]} // [lat, long] กลาง กทม.
      zoom={11}
      style={{ height: "500px", width: "100%", zIndex: 10 }}
      maxBounds={bangkokBounds} // (แก้บั๊ก) ล็อกขอบเขต
      minZoom={10} // ไม่ให้ซูมออกไกลเกินไป
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <LayersControl position="topright">
        {/* (ปรับแก้) ใช้ข้อมูลที่กรองแล้ว (filteredDistricts) */}
        {filteredDistricts && (
          <LayersControl.Overlay checked name="ขอบเขตเขต">
            <GeoJSON
              key={selectedDcode + "_districts"} // (สำคัญ) เพิ่ม Key เพื่อบังคับ Re-render
              data={filteredDistricts}
              style={districtStyle}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.dname) {
                  layer.bindPopup(feature.properties.dname);
                }
              }}
            />
          </LayersControl.Overlay>
        )}

        {/* (ปรับแก้) ใช้ข้อมูลที่กรองแล้ว (filteredFloodPoints) */}
        {filteredFloodPoints && (
          <LayersControl.Overlay checked name="จุดเสี่ยงน้ำท่วม">
            <GeoJSON
              key={selectedDcode + "_floodpoints"} // (สำคัญ) เพิ่ม Key
              data={filteredFloodPoints}
              pointToLayer={(feature, latlng) => {
                return L.marker(latlng, { icon: redIcon });
              }}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
          </LayersControl.Overlay>
        )}

        {/* (ปรับแก้) ใช้ข้อมูลที่กรองแล้ว (filteredFloodgates) */}
        {filteredFloodgates && (
          <LayersControl.Overlay name="ประตูน้ำ">
            <GeoJSON
              key={selectedDcode + "_floodgates"} // (สำคัญ) เพิ่ม Key
              data={filteredFloodgates}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              }}
            />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
}
