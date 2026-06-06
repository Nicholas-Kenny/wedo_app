// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman refresh saat tombol ditekan
    setError('');

    try {
      // 1. Tembak API Backend
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;

      // 2. Simpan token ke "brankas" browser
      localStorage.setItem('access_token', access_token);

      // 3. Arahkan user ke halaman papan Kanban
      navigate('/dashboard');
    } catch (err: any) {
      // Tangkap pesan error dari backend jika kredensial salah
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">WeDo</h2>
          <p className="text-gray-500 mt-2">Masuk ke ruang kerja Anda</p>
        </div>

        {/* Tampilkan kotak merah jika ada error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="contoh@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 transition-colors mt-2"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}