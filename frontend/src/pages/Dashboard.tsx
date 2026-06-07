// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummary,
  createProject,
  inviteMember,
  acceptInvitation,
} from "../api/client";
import {
  FolderKanban,
  Plus,
  X,
  CalendarClock,
  AlertCircle,
  BellRing,
  CheckCircle,
  Users,
} from "lucide-react";

// --- Interfaces ---
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

interface PendingInvitation {
  projectId: string;
  project: { title: string; description: string };
}

export default function Dashboard() {
  const navigate = useNavigate();

  // State Data Dashboard
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Create Project
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [customStagesInput, setCustomStagesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Invite
  const [inviteModalProjectId, setInviteModalProjectId] = useState<
    string | null
  >(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Memanggil API Facade yang merangkum semua data
      const data = await getDashboardSummary();
      setProjects(data.userProjects || []);
      setUpcomingTasks(data.upcomingTasks || []);
      setPendingInvitations(data.pendingInvitations || []);
    } catch (error) {
      console.error("Gagal memuat data dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Handlers ---
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const stages = customStagesInput.trim()
        ? customStagesInput
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : undefined;

      await createProject({
        title: newTitle,
        description: newDescription,
        customStages: stages,
      });

      // Reset form
      setNewTitle("");
      setNewDescription("");
      setCustomStagesInput("");
      setIsCreateModalOpen(false);

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error("Gagal membuat proyek baru", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModalProjectId || !inviteEmail) return;

    try {
      await inviteMember(inviteModalProjectId, inviteEmail);
      alert("Undangan berhasil dikirim!");
      setInviteModalProjectId(null);
      setInviteEmail("");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengundang user.";
      alert(msg);
    }
  };

  const handleAcceptInvite = async (projectId: string) => {
    try {
      await acceptInvitation(projectId);
      fetchDashboardData(); // Refresh data agar proyek pindah ke daftar aktif
    } catch (error) {
      console.error("Gagal menerima undangan", error);
      alert("Gagal menerima undangan.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        Memuat Dashboard...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* KIRI: KONTEN UTAMA */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Header */}
          <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Dashboard Anda
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Kelola proyek dan pantau produktivitas tim.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" /> Proyek Baru
            </button>
          </header>

          {/* Banner Undangan (Muncul jika ada undangan pending) */}
          {pendingInvitations.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                <BellRing className="w-5 h-5" /> Undangan Proyek (
                {pendingInvitations.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.projectId}
                    className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {inv.project.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {inv.project.description || "Tanpa deskripsi"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptInvite(inv.projectId)}
                      className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 flex items-center justify-center gap-2 transition-colors w-full text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Terima Undangan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daftar Proyek Aktif */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-blue-600" /> Proyek Aktif
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => {
                const isOwner = project.members?.[0]?.role === "OWNER";

                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/board/${project.id}`)}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                        <FolderKanban className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          isOwner
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {isOwner ? "👑 Owner" : "👥 Member"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 flex-1 mb-4">
                      {project.description || "Tidak ada deskripsi."}
                    </p>

                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInviteModalProjectId(project.id);
                        }}
                        className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 w-fit bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4" /> Undang
                      </button>
                    )}
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <FolderKanban className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="font-medium text-lg text-gray-600">
                    Belum ada proyek aktif.
                  </p>
                  <p className="text-sm text-gray-400">
                    Buat proyek baru atau tunggu undangan dari rekan Anda.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KANAN: SIDEBAR DEADLINE (FACADE PATTERN) */}
        <div className="w-full lg:w-[350px]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <CalendarClock className="w-6 h-6 text-rose-500" />
              Prioritas 7 Hari ke Depan
            </h2>

            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition-colors group"
                  >
                    <h4 className="font-bold text-gray-800 text-sm mb-2 group-hover:text-rose-700 transition-colors">
                      {task.title}
                    </h4>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-gray-500">
                        <p className="font-medium text-gray-700 truncate max-w-[120px]">
                          {task.project.title}
                        </p>
                        <p className="text-gray-400">{task.stage.title}</p>
                      </div>
                      <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-md border border-rose-100 flex items-center gap-1.5 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-sm text-gray-500 font-medium">
                    Semua tugas aman!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tidak ada deadline mendesak.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          MODAL PROYEK BARU (BUILDER PATTERN UI)
      ========================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-7 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Buat Proyek Baru
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nama Proyek <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Contoh: Aplikasi WeDo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 transition-all"
                  placeholder="Jelaskan tujuan proyek ini..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-900 mb-1.5">
                  Tahapan Kanban Kustom (Opsional)
                </label>
                <p className="text-xs text-blue-700 mb-3">
                  Pisahkan dengan koma. Jika kosong, akan menggunakan default
                  (To Do, In Progress, Done).
                </p>
                <input
                  type="text"
                  value={customStagesInput}
                  onChange={(e) => setCustomStagesInput(e.target.value)}
                  className="w-full border border-blue-200 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400"
                  placeholder="Contoh: Backlog, Review, Testing, Selesai"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {isSubmitting ? "Menyimpan..." : "Buat Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL UNDANG ANGGOTA
      ========================================= */}
      {inviteModalProjectId && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-7 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Undang Anggota
              </h2>
              <button
                onClick={() => {
                  setInviteModalProjectId(null);
                  setInviteEmail("");
                }}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Email Pengguna
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    required
                    autoFocus
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setInviteModalProjectId(null);
                    setInviteEmail("");
                  }}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
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
