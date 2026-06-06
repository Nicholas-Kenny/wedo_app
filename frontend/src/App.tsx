// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Navbar from "./components/Navbar";

// Komponen Layout untuk halaman yang membutuhkan Navbar (setelah login)
function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      {/* Outlet adalah tempat di mana Dashboard atau Board akan dirender */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik (Tanpa Navbar) */}
        <Route path="/login" element={<Login />} />

        {/* Rute Terproteksi (Dengan Navbar) */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/board/:projectId" element={<Board />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
