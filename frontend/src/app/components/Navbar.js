// frontend/src/app/components/Navbar.js
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          FlowCast BKK
        </Link>
        <div className="space-x-4">
          <Link href="/model" className="hover:text-gray-300">
            Model
          </Link>
          <Link href="/data" className="hover:text-gray-300">
            Data
          </Link>
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
