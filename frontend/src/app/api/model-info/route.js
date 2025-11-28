import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "district_clustered_comparison.csv"
  );

  let clusters = { k3: [], k4: [], k6: [] };
  let clusterProfile = [];

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
    });
    const rows = parsed.data.filter((r) => r.dcode);

    // --- 1. Process Scatter Plot (เหมือนเดิม) ---
    const processCluster = (dataRows, kColumn) => {
      const groups = {};
      dataRows.forEach((row) => {
        const groupId = `Group ${row[kColumn]}`;
        if (!groups[groupId]) groups[groupId] = { id: groupId, data: [] };
        groups[groupId].data.push({
          x: row.PC1,
          y: row.PC2,
          district: row.dname,
          load: row.rain_load_per_pump,
        });
      });
      return Object.values(groups);
    };

    clusters.k3 = processCluster(rows, "cluster");
    clusters.k4 = processCluster(rows, "cluster_k4");
    clusters.k6 = processCluster(rows, "cluster_k6");

    // --- 2. Process Cluster Profile (แก้ไขใหม่: เพิ่มตัวแปรให้ครบ 6 ตัว) ---
    const features = [
      { key: "total_rain", label: "Total Rain" },
      { key: "rain_load_per_pump", label: "Rain Load / Pump" },
      { key: "pump_density", label: "Pump Density" },
      { key: "canal_density", label: "Canal Density" },
      { key: "pop_density", label: "Pop. Density" },
      { key: "flood_point_count", label: "Flood Points" },
    ];

    // 2.1 คำนวณค่าเฉลี่ย (Mean)
    const profileMap = {};
    rows.forEach((row) => {
      const c = row.cluster;
      if (c === undefined) return;

      if (!profileMap[c]) {
        profileMap[c] = { count: 0, sums: {} };
        features.forEach((f) => (profileMap[c].sums[f.key] = 0));
      }

      profileMap[c].count++;
      features.forEach((f) => (profileMap[c].sums[f.key] += row[f.key] || 0));
    });

    const rawProfiles = Object.keys(profileMap).map((clusterId) => {
      const p = profileMap[clusterId];
      const item = { id: `Cluster ${clusterId}` };
      features.forEach((f) => {
        item[f.key] = p.sums[f.key] / p.count;
      });
      return item;
    });

    // 2.2 Normalize (0-1) เพื่อใช้แสดงผล
    const featureStats = {};
    features.forEach((f) => {
      const values = rawProfiles.map((p) => p[f.key]);
      featureStats[f.key] = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    clusterProfile = rawProfiles.map((p) => {
      const normalized = {};
      features.forEach((f) => {
        const { min, max } = featureStats[f.key];
        // คำนวณค่า 0-1
        normalized[f.key] = max === min ? 0 : (p[f.key] - min) / (max - min);
      });
      // ส่งไปทั้งค่าจริง (raw) และค่าแปลง (normalized)
      return { ...p, normalized };
    });

    clusterProfile.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error("Error processing CSV:", error);
  }

  const modelMetrics = [
    { model: "XGBoost", Accuracy: 1.0, F1: 1.0 },
    { model: "Random Forest", Accuracy: 0.996, F1: 0.936 },
    { model: "Logistic Regression", Accuracy: 0.988, F1: 0.898 },
  ];

  return NextResponse.json({ clusters, modelMetrics, clusterProfile });
}
