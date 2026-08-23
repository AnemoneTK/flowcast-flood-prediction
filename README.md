# 🌊 FlowCast: Bangkok Flood Prediction Project 🚀

![License](https://img.shields.io/badge/License-MIT-blue.svg)

> โครงการวิทยานิพนธ์เพื่อพัฒนาแบบจำลอง Machine Learning สำหรับการพยากรณ์และแสดงผลพื้นที่เสี่ยงน้ำท่วมในเขตกรุงเทพมหานครแบบ Real-time

---

## 📍 ภาพรวม (Overview)

**FlowCast** เป็นโครงการที่นำข้อมูลจากหลายแหล่ง (เช่น กรมอุตุนิยมวิทยา, กรมชลประทาน) มาใช้ในการสร้างแบบจำลองการเรียนรู้ของเครื่อง (Machine Learning) เพื่อคาดการณ์ความเสี่ยงน้ำท่วมล่วงหน้าในแต่ละเขตของกรุงเทพฯ ผลลัพธ์จะถูกนำเสนอผ่าน Interactive Dashboard ที่เข้าใจง่าย เพื่อช่วยให้ประชาชนและหน่วยงานที่เกี่ยวข้องสามารถเตรียมพร้อมและรับมือกับสถานการณ์ได้อย่างทันท่วงที

### ✨ คุณสมบัติหลัก (Key Features)

-   **🤖 การพยากรณ์ความเสี่ยงรายเขต:** ประเมินระดับความเสี่ยง (ปลอดภัย, เฝ้าระวัง, เสี่ยงสูง) ล่วงหน้า 12-24 ชั่วโมง
-   **📊 Dashboard แบบ Interactive:** แสดงผลบนแผนที่ 3D พร้อมข้อมูลสภาพอากาศและระดับน้ำแบบ Real-time
-   **📈 การวิเคราะห์ข้อมูลย้อนหลัง:** แสดงสถิติและแนวโน้มการเกิดน้ำท่วมในอดีต
-   **⚙️ ระบบอัตโนมัติ:** Data Pipeline ที่รวบรวมและประมวลผลข้อมูลล่าสุดอย่างสม่ำเสมอ

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนงาน              | เทคโนโลยี                                                              |
| ------------------- | ---------------------------------------------------------------------- |
| **Backend & ML** | Python, FastAPI, Pandas, Scikit-learn, Docker                          |
| **Data Pipeline** | Apache Airflow (TBC), Google Cloud Storage                             |
| **Database** | PostgreSQL + PostGIS, Google BigQuery (TBC)                            |
| **Frontend** | React.js, Mapbox GL JS / Deck.gl, D3.js                 |
| **Deployment** | Google Cloud Run (Backend), Vercel (Frontend), GitHub Actions (CI/CD)  |

## 🚀 การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### สิ่งที่ต้องมี (Prerequisites)

-   Python 3.9+
-   Node.js & npm (สำหรับ Frontend)
-   Docker

### การติดตั้ง (Installation)

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/YourUsername/flowcast-flood-prediction.git](https://github.com/YourUsername/flowcast-flood-prediction.git)
    cd flowcast-flood-prediction
    ```

2.  **ติดตั้ง Backend (Python):**
    ```sh
    # แนะนำให้สร้าง Virtual Environment ก่อน
    pip install -r requirements.txt
    ```

3.  **ติดตั้ง Frontend (JavaScript):**
    ```sh
    cd frontend-dashboard
    npm install
    ```

### การรันโปรเจกต์ (Running the application)

-   **รัน Backend API Server:**
    ```sh
    # จากโฟลเดอร์หลัก
    uvicorn src.api.main:app --reload
    ```
-   **รัน Frontend Dashboard:**
    ```sh
    # จากโฟลเดอร์ frontend-dashboard
    npm run dev
    ```

## 📂 โครงสร้างโปรเจกต์ (Project Structure)
```
├── data/             # เก็บข้อมูลดิบ, ข้อมูลที่แปรรูปแล้ว
├── deployment/       # Dockerfile, CI/CD configs
├── frontend-dashboard/ # โค้ดหน้าเว็บ Dashboard
├── notebooks/        # Jupyter Notebooks สำหรับทดลอง
├── src/              # Source code หลักของ Backend (API, ML, Pipeline)
├── saved_models/     # ไฟล์โมเดลที่เทรนแล้ว
└── README.md
```

## 📄 License

โครงการนี้อยู่ภายใต้ใบอนุญาต **MIT License** - ดูรายละเอียดเพิ่มเติมได้ที่ไฟล์ `LICENSE`

## 🙏 กิตติกรรมประกาศ (Acknowledgements)

-   ขอขอบคุณข้อมูลสำคัญจาก กรมอุตุนิยมวิทยา, กรมชลประทาน, และ GISTDA

---
