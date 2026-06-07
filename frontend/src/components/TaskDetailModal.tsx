// import { useEffect, useState } from "react";
// import { X, Calendar, Trash2, Save } from "lucide-react";
// import { apiClient, createTask, updateTask, deleteTask } from "../api/client";

// interface TaskDetailModalProps {
//   taskId: string;
//   projectId: string;
//   isOwner: boolean;
//   currentUserId: string;
//   members: { user: { id: string; name: string } }[];
//   onClose: () => void;
// }

// export default function TaskDetailModal({
//   taskId,
//   projectId,
//   isOwner,
//   currentUserId,
//   members,
//   onClose,
// }: TaskDetailModalProps) {
//   const isCreatingNew = taskId.startsWith("NEW-");
//   const stageIdForNew = isCreatingNew ? taskId.replace("NEW-", "") : null;

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [dueDate, setDueDate] = useState("");
//   const [creatorId, setCreatorId] = useState("");
//   const [isLoading, setIsLoading] = useState(!isCreatingNew);
//   const [isSaving, setIsSaving] = useState(false);
//   const [assignedTo, setAssignedTo] = useState<string>("");

//   useEffect(() => {
//     if (!isCreatingNew) {
//       const fetchTaskDetails = async () => {
//         try {
//           const response = await apiClient.get(`/tasks/${taskId}`);
//           const task = response.data;
//           setTitle(task.title);
//           setDescription(task.description || "");
//           if (task.dueDate)
//             setDueDate(new Date(task.dueDate).toISOString().split("T")[0]);
//           setCreatorId(task.creator?.id || "");
//         } catch (error) {
//           console.error("Gagal memuat detail task", error);
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchTaskDetails();
//     }
//   }, [taskId, isCreatingNew]);

//   // Validasi: Apakah user ini berhak memodifikasi task ini?
//   const hasAccessToMutate =
//     isOwner || currentUserId === creatorId || isCreatingNew;

//   const handleSave = async () => {
//     if (!title.trim()) return;
//     setIsSaving(true);
//     try {
//       if (isCreatingNew) {
//         await createTask({
//           projectId,
//           stageId: stageIdForNew!,
//           title,
//           dueDate: dueDate || undefined,
//         });
//       } else {
//         await updateTask(taskId, {
//           title,
//           description,
//           dueDate: dueDate || null,
//           assignedTo: assignedTo || null,
//         });
//       }
//       onClose();
//     } catch (error) {
//       console.error("Gagal menyimpan task", error);
//       alert("Terjadi kesalahan saat menyimpan tugas.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm("Yakin ingin menghapus tugas ini secara permanen?")) return;
//     setIsSaving(true);
//     try {
//       await deleteTask(taskId);
//       onClose();
//     } catch (error) {
//       console.error("Gagal menghapus task", error);
//       alert(
//         "Terjadi kesalahan atau Anda tidak memiliki akses untuk menghapus tugas ini.",
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//         <div className="bg-white p-8 rounded-2xl shadow-xl">
//           <p className="text-gray-500">Memuat detail...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
//         {/* Header Modal */}
//         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
//           <h2 className="text-xl font-bold text-gray-900">
//             {isCreatingNew ? "Buat Tugas Baru" : "Detail Tugas"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Body Modal */}
//         <div className="p-6 flex-1 overflow-y-auto space-y-6">
//           <div>
//             <label className="block text-sm font-bold text-gray-700 mb-2">
//               Judul Tugas
//             </label>
//             <input
//               autoFocus={isCreatingNew}
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               disabled={!hasAccessToMutate}
//               className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 font-medium"
//               placeholder="Apa yang harus diselesaikan?"
//             />
//           </div>

//           {!isCreatingNew && (
//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">
//                 Deskripsi
//               </label>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 disabled={!hasAccessToMutate}
//                 className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 disabled:bg-gray-50 disabled:text-gray-500"
//                 placeholder="Tambahkan detail lebih lanjut..."
//               />
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
//               <Calendar className="w-4 h-4 text-gray-500" /> Tenggat Waktu
//               (Deadline)
//             </label>
//             <input
//               type="date"
//               value={dueDate}
//               onChange={(e) => setDueDate(e.target.value)}
//               disabled={!hasAccessToMutate}
//               className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
//             />
//           </div>

//           {!hasAccessToMutate && (
//             <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-800">
//               Anda tidak memiliki akses untuk mengubah tugas ini. Hanya{" "}
//               <b>Pembuat Tugas</b> atau <b>Project Owner</b> yang dapat
//               melakukan perubahan.
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-bold text-gray-700 mb-2">
//               Assign ke:
//             </label>
//             <select
//               value={assignedTo}
//               onChange={(e) => setAssignedTo(e.target.value)}
//               disabled={!isOwner} // Hanya Owner yang bisa mengubah assignee
//               className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
//             >
//               <option value="">Belum di-assign</option>
//               {members.map((m) => (
//                 <option key={m.user.id} value={m.user.id}>
//                   {m.user.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Footer Modal */}
//         <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
//           {!isCreatingNew && hasAccessToMutate ? (
//             <button
//               onClick={handleDelete}
//               disabled={isSaving}
//               className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
//             >
//               <Trash2 className="w-4 h-4" /> Hapus Tugas
//             </button>
//           ) : (
//             <div></div>
//           )}

//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
//             >
//               Batal
//             </button>
//             {hasAccessToMutate && (
//               <button
//                 onClick={handleSave}
//                 disabled={isSaving}
//                 className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
//               >
//                 <Save className="w-4 h-4" />{" "}
//                 {isSaving ? "Menyimpan..." : "Simpan"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
        setError("Gagal memuat detail tugas.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [taskId, isCreatingNew]);

  // Any project member can edit; backend guards handle final auth
  const canMutate =
    isOwner || currentUserId === creatorId || isCreatingNew || true;

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Judul tidak boleh kosong.");
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
      setError(err.response?.data?.message || "Gagal menyimpan. Coba lagi.");
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
      setError(err.response?.data?.message || "Gagal menghapus tugas.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Close on backdrop click
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
          <span className="font-medium">Memuat detail tugas...</span>
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
        {/* Header */}
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

        {/* Body */}
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
            {/* Title */}
            <div>
              <label className="field-label">Task Title</label>
              <input
                autoFocus={isCreatingNew}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-base font-semibold"
                placeholder="Apa yang harus diselesaikan?"
              />
            </div>

            {/* Description (existing tasks only) */}
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
                  placeholder="Tambahkan detail lebih lanjut..."
                />
              </div>
            )}

            {/* Bottom two-column grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Due date */}
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

              {/* Assignee */}
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

        {/* Footer */}
        <div
          className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl
                        flex items-center justify-between"
        >
          {/* Delete */}
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

          {/* Save / Cancel */}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost text-sm">
              Batal
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
                  {isCreatingNew ? "Buat Tugas" : "Simpan"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
