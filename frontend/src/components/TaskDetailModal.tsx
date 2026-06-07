import { useEffect, useState } from "react";
import { X, Calendar, Trash2, Save } from "lucide-react";
import { apiClient, createTask, updateTask, deleteTask } from "../api/client";

interface TaskDetailModalProps {
  taskId: string;
  projectId: string;
  isOwner: boolean;
  currentUserId: string;
  members: { user: { id: string; name: string } }[];
  onClose: () => void;
}

export default function TaskDetailModal({
  taskId,
  projectId,
  isOwner,
  currentUserId,
  members,
  onClose,
}: TaskDetailModalProps) {
  const isCreatingNew = taskId.startsWith("NEW-");
  const stageIdForNew = isCreatingNew ? taskId.replace("NEW-", "") : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [isLoading, setIsLoading] = useState(!isCreatingNew);
  const [isSaving, setIsSaving] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>("");

  useEffect(() => {
    if (!isCreatingNew) {
      const fetchTaskDetails = async () => {
        try {
          const response = await apiClient.get(`/tasks/${taskId}`);
          const task = response.data;
          setTitle(task.title);
          setDescription(task.description || "");
          if (task.dueDate)
            setDueDate(new Date(task.dueDate).toISOString().split("T")[0]);
          setCreatorId(task.creator?.id || "");
        } catch (error) {
          console.error("Gagal memuat detail task", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTaskDetails();
    }
  }, [taskId, isCreatingNew]);

  // Validasi: Apakah user ini berhak memodifikasi task ini?
  const hasAccessToMutate =
    isOwner || currentUserId === creatorId || isCreatingNew;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      if (isCreatingNew) {
        await createTask({
          projectId,
          stageId: stageIdForNew!,
          title,
          dueDate: dueDate || undefined,
        });
      } else {
        await updateTask(taskId, {
          title,
          description,
          dueDate: dueDate || null,
          assignedTo: assignedTo || null,
        });
      }
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan task", error);
      alert("Terjadi kesalahan saat menyimpan tugas.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus tugas ini secara permanen?")) return;
    setIsSaving(true);
    try {
      await deleteTask(taskId);
      onClose();
    } catch (error) {
      console.error("Gagal menghapus task", error);
      alert(
        "Terjadi kesalahan atau Anda tidak memiliki akses untuk menghapus tugas ini.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-gray-500">Memuat detail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isCreatingNew ? "Buat Tugas Baru" : "Detail Tugas"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Judul Tugas
            </label>
            <input
              autoFocus={isCreatingNew}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!hasAccessToMutate}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 font-medium"
              placeholder="Apa yang harus diselesaikan?"
            />
          </div>

          {!isCreatingNew && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!hasAccessToMutate}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Tambahkan detail lebih lanjut..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" /> Tenggat Waktu
              (Deadline)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={!hasAccessToMutate}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {!hasAccessToMutate && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-800">
              Anda tidak memiliki akses untuk mengubah tugas ini. Hanya{" "}
              <b>Pembuat Tugas</b> atau <b>Project Owner</b> yang dapat
              melakukan perubahan.
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Assign ke:
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={!isOwner} // Hanya Owner yang bisa mengubah assignee
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
            >
              <option value="">Belum di-assign</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
          {!isCreatingNew && hasAccessToMutate ? (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Hapus Tugas
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            {hasAccessToMutate && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />{" "}
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
