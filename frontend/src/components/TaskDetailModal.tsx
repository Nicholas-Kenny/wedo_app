import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  MessageSquare,
  Trash2,
  AlignLeft,
} from "lucide-react";
import { apiClient } from "../api/client";
import { useBoardStore, type Member } from "../store/useBoardStore";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  assignedTo: string | null;
  stageId: string;
  comments: Comment[];
}

export default function TaskDetailModal({
  taskId,
  members,
  onClose,
}: {
  taskId: string;
  members: Member[];
  onClose: () => void;
}) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [descInput, setDescInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  // Ambil fungsi dari Zustand untuk update UI tanpa refresh
  const { updateTaskInStore, deleteTaskFromStore } = useBoardStore();

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      const res = await apiClient.get(`/tasks/${taskId}`);
      setTask(res.data);
      setDescInput(res.data.description || "");
    } catch (error) {
      console.error("Gagal memuat detail task", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi dinamis untuk update atribut Task (Deskripsi, Deadline, Assignee)
  const handleUpdateField = async (field: string, value: string | null) => {
    try {
      await apiClient.patch(`/tasks/${taskId}`, { [field]: value });
      updateTaskInStore(taskId, { [field]: value }); // Update state lokal
      setTask((prev) => (prev ? { ...prev, [field]: value } : null));
    } catch (error) {
      alert("Gagal memperbarui data");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      const res = await apiClient.post(`/tasks/${taskId}/comments`, {
        content: commentInput,
      });
      setTask((prev) =>
        prev ? { ...prev, comments: [...prev.comments, res.data] } : null,
      );
      setCommentInput("");
    } catch (error) {
      alert("Gagal mengirim komentar");
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm("Yakin ingin menghapus tugas ini?")) return;
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      deleteTaskFromStore(taskId);
      onClose(); // Tutup modal setelah dihapus
    } catch (error) {
      alert("Gagal menghapus tugas");
    }
  };

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl font-medium text-gray-500 shadow-xl">
          Memuat detail...
        </div>
      </div>
    );

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start gap-4 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
          {/* Kolom Kiri: Deskripsi & Komentar */}
          <div className="flex-1 space-y-8">
            {/* Bagian Deskripsi */}
            <section>
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-3">
                <AlignLeft className="w-5 h-5 text-gray-500" /> Deskripsi
              </div>
              <textarea
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                onBlur={() => {
                  if (descInput !== task.description)
                    handleUpdateField("description", descInput);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none min-h-[100px]"
                placeholder="Tambahkan deskripsi lebih detail tentang tugas ini..."
              />
            </section>

            {/* Bagian Komentar */}
            <section>
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-4">
                <MessageSquare className="w-5 h-5 text-gray-500" /> Diskusi &
                Aktivitas
              </div>

              <div className="space-y-4 mb-4">
                {task.comments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Belum ada komentar.
                  </p>
                ) : (
                  task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-gray-900">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Kirim
                </button>
              </form>
            </section>
          </div>

          {/* Kolom Kanan: Atribut Tugas (Deadline, Assignee, Actions) */}
          <div className="w-full md:w-56 shrink-0 space-y-6">
            {/* Assignee */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Dikerjakan Oleh
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <select
                  value={task.assignedTo || ""}
                  onChange={(e) =>
                    handleUpdateField("assignedTo", e.target.value || null)
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 pl-9 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Tidak ada (Unassigned)</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Tenggat Waktu
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="date"
                  value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                  onChange={(e) =>
                    handleUpdateField("dueDate", e.target.value || null)
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 pl-9 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Danger Zone */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Tindakan
              </label>
              <button
                onClick={handleDeleteTask}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Hapus Tugas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
