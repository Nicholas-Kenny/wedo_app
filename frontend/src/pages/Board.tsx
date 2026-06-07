import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBoardStore } from "../store/useBoardStore";
import { Plus, Trash2, Loader2, Calendar } from "lucide-react";
import TaskDetailModal from "../components/TaskDetailModal";
import { apiClient } from "../api/client";
import { Toast, useToast } from "../components/Toast";

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
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days < 0)
    return {
      label: `${Math.abs(days)}h terlambat`,
      cls: "bg-red-100 text-red-700 border-red-200",
    };
  if (days === 0)
    return {
      label: "Hari ini",
      cls: "bg-orange-100 text-orange-700 border-orange-200",
    };
  if (days === 1)
    return {
      label: "Besok",
      cls: "bg-amber-100 text-amber-700 border-amber-200",
    };
  return {
    label: new Date(dueDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    cls: "bg-slate-100 text-slate-500 border-slate-200",
  };
}

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { board, isLoading, fetchBoard, moveTaskOptimistic } = useBoardStore();
  const { toast, showToast, closeToast } = useToast();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");
  const [confirmDeleteStage, setConfirmDeleteStage] = useState<string | null>(
    null,
  );
  const [isDeletingStage, setIsDeletingStage] = useState(false);

  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    if (projectId) fetchBoard(projectId);
  }, [projectId, fetchBoard]);

  // ── Drag & Drop ──
  const handleDragStart = (
    e: React.DragEvent,
    taskId: string,
    sourceStageId: string,
  ) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceStageId", sourceStageId);
  };

  const handleDrop = (e: React.DragEvent, destStageId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStageId = e.dataTransfer.getData("sourceStageId");
    if (taskId && sourceStageId) {
      moveTaskOptimistic(taskId, sourceStageId, destStageId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // ── Stage actions ──
  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim() || !projectId) return;
    try {
      await apiClient.post(`/projects/${projectId}/stages`, {
        title: newStageTitle,
      });
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

  // ── States ──
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 gap-4 p-8">
        <p className="text-xl font-bold text-slate-800">
          Proyek tidak ditemukan
        </p>
        <p className="text-slate-500 text-sm">
          Check the URL or return to the dashboard.
        </p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentUserMember = board.members?.find(
    (m) => m.user.id === currentUserId,
  );
  const isOwner = currentUserMember?.role === "OWNER";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Board sub-header */}
      <div
        className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center
                      justify-between shrink-0"
      >
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            {board.title}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isOwner
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isOwner ? "Owner" : "Member"}
            </span>
            <span className="text-xs text-slate-400">
              {board.members.length} member(s) ·{" "}
              {board.stages.reduce((a, s) => a + s.tasks.length, 0)} task(s)
            </span>
          </div>
        </div>
      </div>

      {/* Kanban area */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-5 items-start h-full">
          {board.stages.map((stage) => (
            <div
              key={stage.id}
              className="w-72 shrink-0 flex flex-col bg-slate-100 rounded-2xl border
                         border-slate-200/80 max-h-full"
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-sm">
                    {stage.title}
                  </span>
                  <span
                    className="text-xs bg-white border border-slate-200 text-slate-500
                                   font-semibold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {stage.tasks.length}
                  </span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setConfirmDeleteStage(stage.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg
                               transition-colors"
                    title="Delete Column"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Delete confirm */}
              {confirmDeleteStage === stage.id && (
                <div className="mx-3 mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-700 font-medium mb-2">
                    Delete this column? All tasks in it will also be deleted.
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={isDeletingStage}
                      onClick={() => handleDeleteStage(stage.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs
                                 font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1
                                 transition-colors disabled:opacity-50"
                    >
                      {isDeletingStage && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
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
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-[80px]">
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
                      className="bg-white rounded-xl border border-slate-200 p-3.5
                                 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5
                                 transition-all cursor-pointer group shadow-sm"
                    >
                      <p className="font-semibold text-slate-800 text-sm leading-snug mb-2">
                        {task.title}
                      </p>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Due date badge */}
                        {badge && (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium
                                           border rounded-full px-2 py-0.5 ${badge.cls}`}
                          >
                            <Calendar className="w-3 h-3" />
                            {badge.label}
                          </span>
                        )}

                        {/* Assignee avatar */}
                        {assigneeMember && (
                          <div
                            className="w-6 h-6 rounded-full bg-blue-100 text-blue-700
                                          text-xs font-bold flex items-center justify-center
                                          border-2 border-white shadow-sm ml-auto"
                            title={assigneeMember.user.name}
                          >
                            {assigneeMember.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add task button */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => setSelectedTaskId(`NEW-${stage.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                             text-sm font-medium text-slate-400 hover:text-slate-700
                             hover:bg-slate-200/60 transition-colors border-2 border-dashed
                             border-transparent hover:border-slate-300"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>
            </div>
          ))}

          {/* Add column */}
          {isOwner && (
            <div className="w-72 shrink-0">
              {isAddingStage ? (
                <form
                  onSubmit={handleAddStage}
                  className="bg-slate-100 rounded-2xl border border-slate-200 p-4"
                >
                  <input
                    autoFocus
                    type="text"
                    value={newStageTitle}
                    onChange={(e) => setNewStageTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Escape" && setIsAddingStage(false)
                    }
                    placeholder="Nama kolom..."
                    className="input text-sm mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!newStageTitle.trim()}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingStage(false)}
                      className="btn-ghost flex-1 text-sm py-2"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingStage(true)}
                  className="w-full flex items-center gap-2 p-4 rounded-2xl border-2
                             border-dashed border-slate-300 text-slate-400 font-semibold
                             hover:text-slate-700 hover:border-slate-400 hover:bg-slate-100
                             transition-all text-sm"
                >
                  <Plus className="w-5 h-5" /> Add Column
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
}
