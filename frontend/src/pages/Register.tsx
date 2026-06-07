import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { Loader2, CheckCircle } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/40 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-700/40 rounded-full" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Join WeDo
          </h1>
          <p className="text-blue-100 text-lg max-w-xs leading-relaxed">
            Create a free account and start managing your team projects
            today.{" "}
          </p>
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            {[
              "Create unlimited projects",
              "Invite team members",
              "Easily monitor deadlines",
              "Manage your own workflow",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-blue-200 shrink-0" />
                <span className="text-blue-50">{f}</span>
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
              <h2 className="text-2xl font-bold text-slate-900">
                Create New Account
              </h2>
            </div>

            {error && (
              <div
                className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200
                              rounded-xl px-4 py-3 text-sm text-red-700 font-medium"
              >
                <span className="mt-0.5"></span>
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
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Register..." : "Create an Account"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Log In Here{" "}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
