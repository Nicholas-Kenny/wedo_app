// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import {
  FolderKanban,
  Plus,
  X,
  CalendarClock,
  AlertCircle,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  members: { role: string }[];
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  project: { title: string };
  stage: { title: string };
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inviteModal, setInviteModal] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get("/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Gagal memuat proyek", error);
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      const response = await apiClient.get("/tasks/upcoming");
      setUpcomingTasks(response.data);
    } catch (error) {
      console.error("Gagal memuat tugas mendatang", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUpcomingTasks();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/projects", {
        title: newTitle,
        description: newDescription,
      });
      setNewTitle("");
      setNewDescription("");
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Gagal membuat proyek baru", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (projectId: string) => {
    try {
      await apiClient.post(`/projects/${projectId}/invite`, {
        email: inviteEmail,
      });
      alert("User berhasil diundang!");
      setInviteModal(null);
      setInviteEmail("");
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { data?: { message?: string } };
      };
      const msg =
        errorResponse.response?.data?.message || "Gagal mengundang user.";
      alert(msg);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="bg-gray-50 p-8 flex-1">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* KIRI: DAFTAR PROYEK */}
        <div className="flex-1">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Pilih proyek untuk mulai bekerja
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Proyek Baru
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              // Menentukan role user dari data yang dikirim backend
              const isOwner =
                project.members &&
                project.members.length > 0 &&
                project.members[0].role === "OWNER";

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/board/${project.id}`)}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FolderKanban className="w-6 h-6" />
                    </div>
                    {/* Badge Penanda Role */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        isOwner
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {isOwner ? "👑 Owner" : "👥 Member"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                    {project.description || "Tidak ada deskripsi."}
                  </p>

                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInviteModal(project.id);
                      }}
                      className="text-xs text-blue-600 font-semibold hover:underline w-fit"
                    >
                      + Undang Anggota
                    </button>
                  )}
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                Belum ada proyek. Silakan buat proyek pertama Anda!
              </div>
            )}
          </div>
        </div>

        {/* KANAN: SIDEBAR DEADLINE */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-orange-500" />
              Deadline 7 Hari ke Depan
            </h2>

            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-orange-100 bg-orange-50/30 hover:bg-orange-50 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      {task.title}
                    </h4>
                    <div className="flex justify-between items-end mt-3">
                      <div className="text-xs text-gray-500">
                        <p className="font-medium text-gray-700">
                          {task.project.title}
                        </p>
                        <p>{task.stage.title}</p>
                      </div>
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">
                  Hore! Tidak ada tugas mendesak dalam minggu ini. 🎉
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL PROYEK BARU --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Buat Proyek Baru
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Proyek
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Aplikasi WeDo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                  placeholder="Jelaskan tujuan proyek ini..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Buat Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL UNDANG ANGGOTA --- */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                Undang Anggota
              </h2>
              <button
                onClick={() => {
                  setInviteModal(null);
                  setInviteEmail("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInvite(inviteModal);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Anggota
                </label>
                <input
                  autoFocus
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="contoh@email.com"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setInviteModal(null);
                    setInviteEmail("");
                  }}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
