import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBoardStore } from "../store/useBoardStore";
import TaskDetailModal from "../components/TaskDetailModal";
import { apiClient } from "../api/client";
import { Toast, useToast } from "../components/Toast";
import { Plus, Trash2, Loader2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const getUserIdFromToken = (): string => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return "";
    return JSON.parse(window.atob(token.split(".")[1])).sub || "";
  } catch {
    return "";
  }
};

function dueBadge(dueDate: string) {
  const days = Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / 86400000,
  );
  if (days < 0)
    return {
      label: `${Math.abs(days)}h terlambat`,
      cls: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-500",
    };
  if (days === 0)
    return {
      label: "Hari ini",
      cls: "bg-orange-100 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
    };
  if (days === 1)
    return {
      label: "Besok",
      cls: "bg-amber-100 text-amber-700 border-amber-200",
      dot: "bg-amber-400",
    };
  return {
    label: new Date(dueDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    cls: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-300",
  };
}

function getAdjacentStages(
  stages: { id: string; title: string }[],
  currentStageId: string
) {
  const idx = stages.findIndex((s) => s.id === currentStageId);
  return {
    prev: idx > 0 ? stages[idx - 1] : null,
    next: idx < stages.length - 1 ? stages[idx + 1] : null,
  };
}

const COLUMN_ACCENTS = [
  "from-blue-500 to-blue-400",
  "from-violet-500 to-violet-400",
  "from-emerald-500 to-emerald-400",
  "from-amber-500 to-amber-400",
  "from-rose-500 to-rose-400",
  "from-cyan-500 to-cyan-400",
  "from-fuchsia-500 to-fuchsia-400",
  "from-teal-500 to-teal-400",
];

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { board, isLoading, fetchBoard, moveTaskOptimistic } = useBoardStore();
  const { toast, showToast, closeToast } = useToast();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");
  const [confirmDeleteStage, setConfirmDeleteStage] = useState<string | null>(null);
  const [isDeletingStage, setIsDeletingStage] = useState(false);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    if (projectId) fetchBoard(projectId);
  }, [projectId, fetchBoard]);

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceStageId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceStageId", sourceStageId);
  };

  const handleDrop = (e: React.DragEvent, destStageId: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStageId = e.dataTransfer.getData("sourceStageId");
    if (taskId && sourceStageId) {
      moveTaskOptimistic(taskId, sourceStageId, destStageId);
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim() || !projectId) return;
    try {
      await apiClient.post(`/projects/${projectId}/stages`, { title: newStageTitle });
      setNewStageTitle("");
      setIsAddingStage(false);
      fetchBoard(projectId);
    } catch {
      showToast("Gagal menambah kolom.", "error");
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!projectId) return;
    setIsDeletingStage(true);
    try {
      await apiClient.delete(`/projects/${projectId}/stages/${stageId}`);
      setConfirmDeleteStage(null);
      fetchBoard(projectId);
    } catch {
      showToast("Gagal menghapus kolom.", "error");
    } finally {
      setIsDeletingStage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-4 p-8">
        <p className="text-xl font-bold text-slate-800">Proyek tidak ditemukan</p>
        <p className="text-slate-500 text-sm">Check the URL or return to the dashboard.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentUserMember = board.members?.find((m) => m.user.id === currentUserId);
  const isOwner = currentUserMember?.role === "OWNER";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="relative bg-blue-600 px-4 sm:px-6 py-4 sm:py-6 shrink-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-blue-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-4 right-32 w-16 h-16 bg-white/10 rounded-2xl rotate-12 pointer-events-none" />
        <div className="absolute bottom-4 left-16 w-10 h-10 bg-white/10 rounded-xl -rotate-12 pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-lg sm:text-[22px] font-extrabold text-white tracking-tight leading-tight">
            {board.title}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              isOwner
                ? "bg-white/25 text-white border-white/30"
                : "bg-white/15 text-blue-100 border-white/20"
            }`}>
              {isOwner ? "Owner" : "Member"}
            </span>
            <span className="text-xs text-blue-200 font-medium truncate">
              {board.members.length} member(s) · {board.stages.reduce((a, s) => a + s.tasks.length, 0)} task(s) · {board.stages.length} columns
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 mt-3 sm:mt-5">
          {[
            { num: board.stages.length, label: "Columns" },
            { num: board.stages.reduce((a, s) => a + s.tasks.length, 0), label: "Total Tasks" },
            { num: board.members.length, label: "Members" },
          ].map(({ num, label }) => (
            <div
              key={label}
              className="bg-white/15 border border-white/20 backdrop-blur-sm rounded-xl
                        px-3 py-2 flex items-center gap-2"
            >
              <span className="text-[18px] sm:text-[20px] font-extrabold text-white leading-none">
                {num}
              </span>
              <span className="text-[11px] text-blue-200 font-medium leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kanban area ── */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-6">
        <div className="flex gap-3 sm:gap-4 items-start min-h-full">
          {board.stages.map((stage, idx) => {
            const accent = COLUMN_ACCENTS[idx % COLUMN_ACCENTS.length];
            const isDragTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`w-[240px] sm:w-[272px] shrink-0 flex flex-col rounded-2xl border transition-all duration-150 max-h-full
                  ${isDragTarget
                    ? "border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.3)] bg-blue-50/50"
                    : "border-slate-200/80 bg-white shadow-sm"
                  }`}
                onDrop={(e) => handleDrop(e, stage.id)}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
              >
                {/* Column color bar */}
                <div className={`h-1 rounded-t-2xl bg-gradient-to-r ${accent}`} />

                {/* Column header */}
                <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-[12px] sm:text-[13px] tracking-wide uppercase truncate max-w-[120px] sm:max-w-none">
                      {stage.title}
                    </span>
                    <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-500
                                    font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {stage.tasks.length}
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setConfirmDeleteStage(stage.id)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors shrink-0"
                      title="Delete Column"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Delete confirm */}
                {confirmDeleteStage === stage.id && (
                  <div className="mx-3 mb-2 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-red-700 font-medium mb-2">
                      Delete this column? All tasks will also be deleted.
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={isDeletingStage}
                        onClick={() => handleDeleteStage(stage.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs
                                  font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1
                                  transition-colors disabled:opacity-50"
                      >
                        {isDeletingStage && <Loader2 className="w-3 h-3 animate-spin" />}
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteStage(null)}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-600 text-xs
                                  font-semibold py-1.5 rounded-lg border border-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Task list */}
                <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-2 min-h-[80px]">
                  {stage.tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-300">
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-2">
                        <Plus className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium">Drop tasks here</p>
                    </div>
                  )}
                  {stage.tasks.map((task) => {
                    const badge = task.dueDate ? dueBadge(task.dueDate) : null;
                    const assigneeMember = board.members.find(
                      (m) => m.user.id === task.assignedTo,
                    );

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id, stage.id)}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-white rounded-xl border border-slate-200 p-3
                                  hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-blue-200
                                  hover:-translate-y-0.5 transition-all cursor-pointer
                                  active:scale-[0.98] select-none"
                      >
                        <p className="font-semibold text-slate-800 text-[13px] leading-snug mb-2.5">
                          {task.title}
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          {badge ? (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold
                                              border rounded-full px-2 py-0.5 shrink-0 ${badge.cls}`}>
                              <Calendar className="w-3 h-3" />
                              {badge.label}
                            </span>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center gap-1 ml-auto">
                            {(() => {
                              const { prev, next } = getAdjacentStages(board.stages, stage.id);
                              return (
                                <>
                                  {prev && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveTaskOptimistic(task.id, stage.id, prev.id);
                                      }}
                                      className="w-5 h-5 rounded flex items-center justify-center
                                                text-slate-300 hover:text-slate-600 hover:bg-slate-100
                                                transition-colors"
                                      title={`Move to ${prev.title}`}
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {next && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveTaskOptimistic(task.id, stage.id, next.id);
                                      }}
                                      className="w-5 h-5 rounded flex items-center justify-center
                                                text-slate-300 hover:text-blue-500 hover:bg-blue-50
                                                transition-colors"
                                      title={`Move to ${next.title}`}
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              );
                            })()}

                            {assigneeMember && (
                              <div
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                                          text-white text-[10px] font-bold flex items-center justify-center
                                          border-2 border-white shadow-sm ml-1"
                                title={assigneeMember.user.name}
                              >
                                {assigneeMember.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add task button */}
                <div className="px-3 pb-3 pt-1">
                  <button
                    onClick={() => setSelectedTaskId(`NEW-${stage.id}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
                              text-xs font-semibold text-slate-400 hover:text-blue-600
                              hover:bg-blue-50 transition-colors border border-dashed
                              border-slate-200 hover:border-blue-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── Add Column ── */}
          {isOwner && (
            <div className="w-[240px] sm:w-[272px] shrink-0">
              {isAddingStage ? (
                <form
                  onSubmit={handleAddStage}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
                >
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">New Column</p>
                  <input
                    autoFocus
                    type="text"
                    value={newStageTitle}
                    onChange={(e) => setNewStageTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && setIsAddingStage(false)}
                    placeholder="Column name..."
                    className="input text-sm mb-3"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={!newStageTitle.trim()} className="btn-primary flex-1 text-sm py-2">
                      Save
                    </button>
                    <button type="button" onClick={() => setIsAddingStage(false)} className="btn-ghost flex-1 text-sm py-2">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingStage(true)}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2
                            border-dashed border-slate-200 text-slate-400 font-semibold
                            hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/50
                            transition-all text-sm group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-blue-100
                                  flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  Add Column
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          projectId={projectId!}
          isOwner={isOwner}
          currentUserId={currentUserId}
          members={board.members}
          onClose={() => {
            setSelectedTaskId(null);
            if (projectId) fetchBoard(projectId);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}