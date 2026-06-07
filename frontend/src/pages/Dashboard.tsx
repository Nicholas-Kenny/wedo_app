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
  Loader2,
  Clock,
} from "lucide-react";
import { Toast, useToast } from "../components/Toast";

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

function getUserName(): string {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return "";
    return JSON.parse(atob(token.split(".")[1])).name || "";
  } catch {
    return "";
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();
  const userName = getUserName();

  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [customStagesInput, setCustomStagesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inviteModalProjectId, setInviteModalProjectId] = useState<
    string | null
  >(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardSummary();
      setProjects(data.userProjects || []);
      setUpcomingTasks(data.upcomingTasks || []);
      setPendingInvitations(data.pendingInvitations || []);
    } catch {
      /* silently fail – interceptor handles 401 */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const stages = customStagesInput.trim()
        ? customStagesInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
      await createProject({
        title: newTitle,
        description: newDescription,
        customStages: stages,
      });
      setNewTitle("");
      setNewDescription("");
      setCustomStagesInput("");
      setIsCreateModalOpen(false);
      fetchData();
      showToast("Proyek berhasil dibuat!", "success");
    } catch {
      showToast("Gagal membuat proyek. Coba lagi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModalProjectId || !inviteEmail) return;
    try {
      await inviteMember(inviteModalProjectId, inviteEmail);
      setInviteModalProjectId(null);
      setInviteEmail("");
      showToast("Undangan berhasil dikirim!", "success");
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Gagal mengundang user.",
        "error",
      );
    }
  };

  const handleAcceptInvite = async (projectId: string) => {
    try {
      await acceptInvitation(projectId);
      fetchData();
      showToast("Berhasil bergabung dengan proyek!", "success");
    } catch {
      showToast("Gagal menerima undangan.", "error");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const getDueSeverity = (dueDate: string) => {
    const days = Math.ceil(
      (new Date(dueDate).getTime() - Date.now()) / 86400000,
    );
    if (days < 0) return "overdue";
    if (days <= 1) return "urgent";
    if (days <= 3) return "soon";
    return "normal";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        {/* ── Main Column ── */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {userName
                  ? `Welcome, ${userName.split(" ")[0]} . . `
                  : "Dashboard"}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Simplifying Your Workflow, Amplifying Your Results.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          {/* Pending Invitations Banner */}
          {pendingInvitations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                <BellRing className="w-4 h-4" />
                Undangan Masuk ({pendingInvitations.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.projectId}
                    className="bg-white rounded-xl border border-amber-100 p-4 flex flex-col gap-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {inv.project.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {inv.project.description || "Tanpa deskripsi"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptInvite(inv.projectId)}
                      className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600
                                 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors w-full"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Terima Undangan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">
                Active Projects
              </h2>
              <span className="badge bg-slate-100 text-slate-600">
                {projects.length}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => {
                const isOwner = project.members?.[0]?.role === "OWNER";
                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/board/${project.id}`)}
                    className="card p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5
                               transition-all duration-150 flex flex-col h-full group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl
                                      flex items-center justify-center border border-blue-100
                                      group-hover:scale-110 transition-transform"
                      >
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <span
                        className={`badge ${
                          isOwner
                            ? "bg-violet-50 text-violet-700 border border-violet-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {isOwner ? "Owner" : "Member"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 mb-1.5 text-sm leading-tight">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 flex-1 mb-4">
                      {project.description || "Tidak ada deskripsi."}
                    </p>

                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInviteModalProjectId(project.id);
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600
                                   hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5
                                   rounded-lg transition-colors w-fit"
                      >
                        <Users className="w-3.5 h-3.5" /> Invite Members
                      </button>
                    )}
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div
                  className="col-span-full card py-16 flex flex-col items-center
                                text-slate-400 border-dashed"
                >
                  <FolderKanban className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="font-semibold text-slate-500">
                    Belum ada proyek.
                  </p>
                  <p className="text-sm mt-1">
                    Buat proyek pertama Anda atau tunggu undangan.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary mt-5 flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Buat Proyek
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="card p-5 sticky top-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-rose-500" />
              Deadline in 7 days
            </h2>

            {upcomingTasks.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-600">
                  All Clear!{" "}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  There is no urgent deadline.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map((task) => {
                  const sev = getDueSeverity(task.dueDate);
                  const colors: Record<string, string> = {
                    overdue: "bg-red-50 border-red-200 text-red-700",
                    urgent: "bg-orange-50 border-orange-200 text-orange-700",
                    soon: "bg-amber-50 border-amber-200 text-amber-700",
                    normal: "bg-slate-50 border-slate-200 text-slate-600",
                  };
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border text-xs ${colors[sev]}`}
                    >
                      <p className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1">
                        {task.title}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {task.project.title} · {task.stage.title}
                        </span>
                        <span
                          className={`badge ml-2 shrink-0 flex items-center gap-1 ${colors[sev]}`}
                        >
                          {sev === "overdue" ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Modal: Proyek Baru ── */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center
                        justify-center z-50 p-4"
        >
          <div className="card w-full max-w-lg p-7 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Create New Project
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200
                           p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="field-label">
                  Project Name{" "}
                  <span className="text-red-500 normal-case">*</span>
                </label>
                <input
                  required
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input"
                  placeholder="Aplikasi WeDo"
                />
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="input resize-none h-24"
                  placeholder="Tujuan proyek ini..."
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-800 mb-1.5">
                  Kanban Column Customization
                </label>
                <p className="text-xs text-blue-600 mb-3">
                  Separate with comma. Default: To Do, In Progress, Done.
                </p>
                <input
                  type="text"
                  value={customStagesInput}
                  onChange={(e) => setCustomStagesInput(e.target.value)}
                  className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm
                             bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Backlog, Review, Testing, Selesai"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Undang Anggota ── */}
      {inviteModalProjectId && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center
                        justify-center z-50 p-4"
        >
          <div className="card w-full max-w-md p-7 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Undang Anggota
              </h2>
              <button
                onClick={() => {
                  setInviteModalProjectId(null);
                  setInviteEmail("");
                }}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200
                           p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-5">
              <div>
                <label className="field-label">Email Pengguna</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    required
                    autoFocus
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setInviteModalProjectId(null);
                    setInviteEmail("");
                  }}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                >
                  <Users className="w-4 h-4" /> Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
}
