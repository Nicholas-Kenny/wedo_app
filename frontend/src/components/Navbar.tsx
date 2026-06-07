// // src/components/Navbar.tsx
// import { useNavigate, useLocation } from "react-router-dom";
// import { LogOut, ArrowLeft, LayoutDashboard } from "lucide-react";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Fungsi untuk menghapus token dan menendang user ke halaman login
//   const handleLogout = () => {
//     localStorage.removeItem("access_token");
//     navigate("/login");
//   };

//   // Cek apakah kita sedang berada di dalam halaman spesifik proyek (Board)
//   const isBoardPage = location.pathname.startsWith("/board/");

//   return (
//     <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
//       <div className="flex items-center gap-6">
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => navigate("/dashboard")}
//         >
//           <div className="bg-blue-600 p-1.5 rounded-lg">
//             <LayoutDashboard className="w-5 h-5 text-white" />
//           </div>
//           <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
//             WeDo
//           </span>
//         </div>

//         {/* Tombol "Kembali" hanya muncul jika sedang di dalam Board */}
//         {isBoardPage && (
//           <div className="h-6 w-px bg-gray-300 mx-2"></div> // Garis pemisah
//         )}

//         {isBoardPage && (
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
//           >
//             <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
//           </button>
//         )}
//       </div>

//       <button
//         onClick={handleLogout}
//         className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
//       >
//         <LogOut className="w-4 h-4" /> Keluar
//       </button>
//     </nav>
//   );
// }

import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronLeft } from "lucide-react";

function getUserFromToken(): { name: string; email: string } | null {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { name: payload.name || "User", email: payload.email || "" };
  } catch {
    return null;
  }
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm
                    flex items-center justify-center shrink-0 ring-2 ring-blue-200"
    >
      {initials}
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserFromToken();
  const isBoardPage = location.pathname.startsWith("/board/");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav
      className="bg-white border-b border-slate-200 px-6 h-14 flex items-center
                    justify-between sticky top-0 z-40"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            WeDo
          </span>
        </button>
        {isBoardPage && (
          <>
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500
                         hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg
                         transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <div
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                          bg-slate-50 border border-slate-200"
          >
            <UserAvatar name={user.name} />
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">
              {user.name}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-red-600
                     hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Log Out</span>
        </button>
      </div>
    </nav>
  );
}
