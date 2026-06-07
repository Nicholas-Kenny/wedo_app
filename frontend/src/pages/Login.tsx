import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import wedoLogo from "../assets/wedo-logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div
        className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col items-center
                      justify-center p-12 relative overflow-hidden"
      >

        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-blue-800/40 rounded-full blur-3xl animate-pulse [animation-delay:1.2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-2xl animate-pulse [animation-delay:0.6s]" />

        <div className="absolute top-16 right-16 w-24 h-24 bg-white/10 rounded-3xl rotate-12 animate-bounce [animation-duration:6s]" />
        <div className="absolute bottom-20 left-14 w-16 h-16 bg-white/10 rounded-2xl -rotate-12 animate-bounce [animation-duration:5s] [animation-delay:0.5s]" />
        <div className="absolute top-1/3 right-8 w-10 h-10 bg-white/15 rounded-xl rotate-45 animate-bounce [animation-duration:4s] [animation-delay:1s]" />
        <div className="absolute bottom-1/3 left-8 w-14 h-14 bg-blue-300/20 rounded-full animate-bounce [animation-duration:7s] [animation-delay:0.3s]" />

        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/30 rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-white/25 rounded-full animate-ping [animation-duration:4s] [animation-delay:1s]" />
        <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-white/40 rounded-full animate-ping [animation-duration:2.5s] [animation-delay:0.7s]" />

        <div className="absolute top-28 left-1/3 w-8 h-8 bg-white/10 rotate-45 rounded-sm animate-spin [animation-duration:20s]" />
        <div className="absolute bottom-32 right-1/3 w-6 h-6 bg-white/15 rotate-45 rounded-sm animate-spin [animation-duration:15s] [animation-direction:reverse]" />

        <div className="relative z-10 text-center text-white flex flex-col items-center justify-center">
          <img src={wedoLogo} alt="WeDo" className="h-20 w-auto mb-6 drop-shadow-lg" />
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">WeDo</h1>
          <p className="text-blue-100 text-lg max-w-xs leading-relaxed">
            Simplifying Your Workflow,<br />Amplifying Your Results.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3 text-sm w-full max-w-sm">
            {["🗂 Kanban Board", "👥 Team Collab", "⏰ Deadline Tracker"].map((f) => (
              <div
                key={f}
                className="bg-white/15 rounded-xl px-3 py-2.5 font-medium backdrop-blur-sm
                          border border-white/20 hover:bg-white/25 transition-colors"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <img src={wedoLogo} alt="WeDo" className="h-12 w-auto mb-6 drop-shadow-lg" />
            <span className="text-2xl font-extrabold text-slate-900">WeDo</span>
          </div>

          <div className="card p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Welcome</h2>
              <p className="text-slate-500 mt-1 text-sm">Log in to your workspace.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200
                              rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
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
                  placeholder="name@email.com"
                />
              </div>
              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400
                              hover:text-slate-700 transition-colors p-1 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}