import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronLeft } from "lucide-react";

function getUserFromToken(): { name: string } | null {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { name: payload.name || "User" };
  } catch {
    return null;
  }
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
    <nav className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] bg-blue-600 rounded-[10px] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px] text-white" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <span className="text-[20px] font-extrabold text-slate-900 tracking-tight">WeDo</span>

        {isBoardPage && (
          <>
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500
                        hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <span className="text-sm font-semibold text-slate-800 hidden sm:block">{user.name}</span>
          </>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500
                    hover:text-red-500 border border-slate-200 hover:border-red-200
                    hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>
    </nav>
  );
}