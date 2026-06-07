import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Trash2,
  Save,
  Loader2,
  User,
  AlignLeft,
  AlertCircle,
} from "lucide-react";
import { apiClient, createTask, updateTask, deleteTask } from "../api/client";

interface Member {
  user: { id: string; name: string };
}

interface Props {
  taskId: string;
  projectId: string;
  isOwner: boolean;
  currentUserId: string;
  members: Member[];
  onClose: () => void;
}

export default function TaskDetailModal({
  taskId,
  projectId,
  isOwner,
  currentUserId,
  members,
  onClose,
}: Props) {
  const isCreatingNew = taskId.startsWith("NEW-");
  const stageIdForNew = isCreatingNew ? taskId.replace("NEW-", "") : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [creatorId, setCreatorId] = useState("");

  const [isLoading, setIsLoading] = useState(!isCreatingNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isCreatingNew) return;
    const fetch = async () => {
      try {
        const res = await apiClient.get(`/tasks/${taskId}`);
        const task = res.data;
        setTitle(task.title);
        setDescription(task.description || "");
        setDueDate(
          task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
        );
        setAssignedTo(task.assignedTo || "");
        setCreatorId(task.creator?.id || task.creatorId || "");
      } catch {
        setError("Failed to load task details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [taskId, isCreatingNew]);

  const canMutate =
    isOwner || currentUserId === creatorId || isCreatingNew;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      if (isCreatingNew) {
        await createTask({
          projectId,
          stageId: stageIdForNew!,
          title: title.trim(),
          dueDate: dueDate || undefined,
        });
      } else {
        await updateTask(taskId, {
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
          assignedTo: assignedTo || null,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(taskId);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete task.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center
                      justify-center z-50"
      >
        <div className="card p-8 flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Loading task details..</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center
                    justify-center z-50 p-4"
      onClick={onBackdrop}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col
                      max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isCreatingNew ? "Add New Task" : "Task Detail"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100
                      p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div
              className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200
                            rounded-xl px-4 py-3 text-sm text-red-700 font-medium"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="field-label">Task Title</label>
              <input
                autoFocus={isCreatingNew}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-base font-semibold"
                placeholder="What do you need to do?"
              />
            </div>

            {!isCreatingNew && (
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" /> Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder="Add more details..."
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Deadline
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="field-label flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Assigned To
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  disabled={!isOwner}
                  className="input"
                >
                  <option value="">— Not Assigned Yet —</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
                {!isOwner && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    Only the Owner can change the assignee.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl
                        flex items-center justify-between"
        >
          <div>
            {!isCreatingNew && canMutate && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete Task
              </button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-red-700">
                  Are You Sure?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white
                            text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5
                            hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost text-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />{" "}
                  {isCreatingNew ? "Create Task" : "Save"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
