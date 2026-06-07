import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", { name, email, password });
      const loginRes = await apiClient.post("/auth/login", { email, password });
      localStorage.setItem("access_token", loginRes.data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registrasi gagal. Email mungkin sudah terdaftar.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
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
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm border border-white/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                  M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Join WeDo</h1>
          <p className="text-blue-100 text-lg max-w-xs leading-relaxed">
            Create a free account and start<br />managing your team projects today.
          </p>
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            {[
              "Create unlimited projects",
              "Invite team members",
              "Easily monitor deadlines",
              "Manage your own workflow",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm border border-white/20">
                <CheckCircle className="w-4 h-4 text-blue-200 shrink-0" />
                <span className="text-blue-50 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                    M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-slate-900">WeDo</span>
          </div>

          <div className="card p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">Create New Account</h2>
              <p className="text-slate-500 mt-1 text-sm">Fill in your details to get started.</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200
                              rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="ex. Nicholas"
                />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="ex. fullname@email.com"
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
                    placeholder="Minimum 6 characters"
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
                {/* Password strength hint */}
                {password.length > 0 && (
                  <p className={`text-xs mt-1.5 font-medium ${
                    password.length < 6 ? "text-red-500" : "text-green-600"
                  }`}>
                    {password.length < 6
                      ? `${6 - password.length} more character(s) needed`
                      : "✓ Password looks good!"}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Creating account..." : "Create an Account"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}