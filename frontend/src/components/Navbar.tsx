// src/components/Navbar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fungsi untuk menghapus token dan menendang user ke halaman login
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // Cek apakah kita sedang berada di dalam halaman spesifik proyek (Board)
  const isBoardPage = location.pathname.startsWith("/board/");

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
            WeDo
          </span>
        </div>

        {/* Tombol "Kembali" hanya muncul jika sedang di dalam Board */}
        {isBoardPage && (
          <div className="h-6 w-px bg-gray-300 mx-2"></div> // Garis pemisah
        )}

        {isBoardPage && (
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </button>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        <LogOut className="w-4 h-4" /> Keluar
      </button>
    </nav>
  );
}
