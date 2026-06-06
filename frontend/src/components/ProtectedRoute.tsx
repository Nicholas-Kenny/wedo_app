import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // Cek apakah token JWT tersimpan di dalam localStorage browser
  const token = localStorage.getItem("access_token");

  // Jika token tidak ada, langsung alihkan (redirect) ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada, izinkan React Router me-render komponen di dalamnya (Dashboard/Board)
  return <Outlet />;
}
