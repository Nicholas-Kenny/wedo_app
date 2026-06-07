import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col items-center
                      justify-center p-12 relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/40 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-700/40 rounded-full" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">WeDo</h1>
          <p className="text-blue-100 text-lg max-w-xs leading-relaxed">
            Simplifying Your Workflow, Amplifying Your Results.{" "}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
            {["Kanban Board", "Team Collaboration", "Deadline Tracker"].map(
              (f) => (
                <div
                  key={f}
                  className="bg-white/15 rounded-xl px-3 py-2 font-medium backdrop-blur-sm"
                >
                  {f}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 text-white"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                     M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-slate-900">WeDo</span>
          </div>

          <div className="card p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Welcome</h2>
              <p className="text-slate-500 mt-1 text-sm">
                Log in to your workspace.{" "}
              </p>
            </div>

            {error && (
              <div
                className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200
                              rounded-xl px-4 py-3 text-sm text-red-700 font-medium"
              >
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label className="field-label">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Entering Workspace..." : "Log In"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account yet?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
