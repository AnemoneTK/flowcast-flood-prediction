// frontend/src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; // <-- 1. Import Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FlowCast BKK - Flood Prediction",
  description: "BKK Flood Risk Clustering Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> {/* <-- 2. ใส่ Navbar ไว้ตรงนี้ */}
        <main className="container mx-auto p-4">
          {children} {/* นี่คือส่วนที่เนื้อหาของแต่ละหน้าจะมาแสดง */}
        </main>
      </body>
    </html>
  );
}
