import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummary,
  createProject,
  inviteMember,
  acceptInvitation,
} from "../api/client";
import {
  Plus,
  X,
  CalendarClock,
  AlertCircle,
  BellRing,
  CheckCircle,
  Users,
  Loader2,
  Clock,
  Briefcase,
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

const PROJECT_EMOJIS = ["📋", "🚀", "📊", "🎯", "💡", "🔧", "📁", "⚡"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();
  const userName = getUserName();

  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [customStagesInput, setCustomStagesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inviteModalProjectId, setInviteModalProjectId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardSummary();
      setProjects(data.userProjects || []);
      setUpcomingTasks(data.upcomingTasks || []);
      setPendingInvitations(data.pendingInvitations || []);
    } catch {
      showToast("Failed to load dashboard. Please refresh.", "error")
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const stages = customStagesInput.trim()
        ? customStagesInput.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
      await createProject({ title: newTitle, description: newDescription, customStages: stages });
      setNewTitle(""); setNewDescription(""); setCustomStagesInput("");
      setIsCreateModalOpen(false);
      fetchData();
      showToast("Project created successfully!", "success");
    } catch {
      showToast("Failed to create project. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModalProjectId || !inviteEmail) return;
    try {
      await inviteMember(inviteModalProjectId, inviteEmail);
      setInviteModalProjectId(null); setInviteEmail("");
      showToast("Invitation sent successfully!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to invite user.", "error");
    }
  };

  const handleAcceptInvite = async (projectId: string) => {
    try {
      await acceptInvitation(projectId);
      fetchData();
      showToast("Successfully joined the project!", "success");
    } catch {
      showToast("Failed to accept invitation.", "error");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  const getDueSeverity = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
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
          <p className="text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-3 sm:px-6 py-4 sm:py-8">

          <div className="relative bg-blue-600 rounded-2xl p-4 sm:p-8 mb-5 sm:mb-7 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-blue-800/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute top-4 right-32 w-16 h-16 bg-white/10 rounded-2xl rotate-12 pointer-events-none" />
            <div className="absolute bottom-4 left-16 w-10 h-10 bg-white/10 rounded-xl -rotate-12 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl sm:text-[26px] font-extrabold text-white tracking-tight leading-tight">
                  Welcome back, {userName.split(" ")[0]}
                </h1>
                <p className="text-blue-200 text-xs sm:text-sm font-medium mt-1">
                  Simplifying Your Workflow, Amplifying Your Results.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 bg-white text-blue-700 font-bold text-xs sm:text-sm
                          px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5
                          transition-all duration-150 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Create Project
              </button>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2 mt-4 sm:mt-6">
              {[
                { num: projects.length, label: "Active Projects" },
                { num: upcomingTasks.length, label: "Due This Week" },
                { num: pendingInvitations.length, label: "Invitations" },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="bg-white/15 border border-white/20 backdrop-blur-sm rounded-xl
                            px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2"
                >
                  <span className="text-lg sm:text-[22px] font-extrabold text-white leading-none">
                    {num}
                  </span>
                  <span className="text-[11px] sm:text-[12px] text-blue-200 font-medium leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {pendingInvitations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
              <h2 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                <BellRing className="w-4 h-4" />
                Incoming Invitations ({pendingInvitations.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pendingInvitations.map((inv) => (
                  <div key={inv.projectId} className="bg-white rounded-xl border border-amber-100 p-4 flex flex-col gap-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{inv.project.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {inv.project.description || "No description"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptInvite(inv.projectId)}
                      className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600
                                text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors w-full"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept Invitation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 sm:gap-6">

            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-[15px] font-bold text-slate-900">Active Projects</span>
                <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {projects.length}
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-12 sm:py-16
                                flex flex-col items-center text-slate-400">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <Briefcase className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-500 text-sm">No projects yet.</p>
                  <p className="text-xs mt-1 text-slate-400">Create your first project or wait for an invitation.</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                              text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Create Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {projects.filter((p) => p != null && p.title != null).map((project, idx) => {
                    const isOwner = project.members?.[0]?.role === "OWNER";
                    return (
                      <div
                        key={project.id}
                        onClick={() => navigate(`/board/${project.id}`)}
                        className="relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 cursor-pointer
                                  hover:border-blue-300 hover:shadow-[0_8px_24px_rgba(37,99,235,0.12)]
                                  hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl" />

                        <div className="flex items-start justify-between mb-3 mt-1">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-[10px] flex items-center justify-center text-lg
                                          group-hover:scale-110 transition-transform">
                            {PROJECT_EMOJIS[idx % PROJECT_EMOJIS.length]}
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isOwner
                              ? "bg-violet-50 text-violet-700 border-violet-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {isOwner ? "Owner" : "Member"}
                          </span>
                        </div>

                        <p className="font-bold text-[14px] sm:text-[15px] text-slate-900 truncate mb-1">{project.title}</p>
                        <p className="text-[12px] text-slate-400 font-medium line-clamp-2 mb-3 sm:mb-4">
                          {project.description || "No description"}
                        </p>

                        {isOwner && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setInviteModalProjectId(project.id); }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600
                                      hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5
                                      rounded-lg transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" /> Invite Members
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="min-h-[140px] sm:min-h-[160px] rounded-2xl border-2 border-dashed border-slate-300
                              flex flex-col items-center justify-center gap-2 text-slate-400
                              font-semibold text-sm hover:border-blue-400 hover:text-blue-500
                              hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100
                                    flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    New Project
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 h-fit lg:sticky lg:top-[76px]">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <CalendarClock className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-[13px] font-bold text-slate-900">Deadline in 7 days</span>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-slate-400">
                  <p className="text-sm font-semibold text-slate-500">All Clear!</p>
                  <p className="text-xs text-slate-400 mt-1">There is no urgent deadline.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {upcomingTasks.map((task) => {
                    const sev = getDueSeverity(task.dueDate);
                    const dotColor: Record<string, string> = {
                      overdue: "bg-red-500",
                      urgent: "bg-orange-500",
                      soon: "bg-amber-500",
                      normal: "bg-emerald-500",
                    };
                    const badgeCls: Record<string, string> = {
                      overdue: "bg-red-50 text-red-600 border-red-200",
                      urgent: "bg-orange-50 text-orange-600 border-orange-200",
                      soon: "bg-amber-50 text-amber-600 border-amber-200",
                      normal: "bg-slate-50 text-slate-500 border-slate-200",
                    };
                    return (
                      <div key={task.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor[sev]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 truncate">{task.title}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {task.project?.title} · {task.stage?.title ?? "—"}
                          </p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${badgeCls[sev]}`}>
                          {sev === "overdue"
                            ? <AlertCircle className="w-3 h-3" />
                            : <Clock className="w-3 h-3" />}
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 sm:p-7 shadow-2xl border border-slate-200
                          max-h-[90dvh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Create New Project</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4 sm:space-y-5">
              <div>
                <label className="field-label">Project Name <span className="text-red-500">*</span></label>
                <input required autoFocus type="text" value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input" placeholder="WeDo Application" />
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                  className="input resize-none h-20 sm:h-24" placeholder="Project goal..." />
              </div>
              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-800 mb-1.5">Kanban Column Customization</label>
                <p className="text-xs text-blue-600 mb-3">Separate with comma. Default: To Do, In Progress, Done.</p>
                <input type="text" value={customStagesInput}
                  onChange={(e) => setCustomStagesInput(e.target.value)}
                  className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm
                            bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Backlog, Review, Testing, Done" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)}
                  className="btn-ghost">Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inviteModalProjectId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-7 shadow-2xl border border-slate-200">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Invite Member</h2>
              <button
                onClick={() => { setInviteModalProjectId(null); setInviteEmail(""); }}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4 sm:space-y-5">
              <div>
                <label className="field-label">User Email</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input required autoFocus type="email" value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input pl-10" placeholder="name@email.com" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button"
                  onClick={() => { setInviteModalProjectId(null); setInviteEmail(""); }}
                  className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Users className="w-4 h-4" /> Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}