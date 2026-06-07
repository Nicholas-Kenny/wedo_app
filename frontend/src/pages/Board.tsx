// src/pages/Board.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBoardStore } from "../store/useBoardStore";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import TaskDetailModal from "../components/TaskDetailModal";
import { apiClient } from "../api/client";

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return "";
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64)).sub;
  } catch (e) {
    console.error("Gagal parse token:", e);
    return "";
  }
};

export default function Board() {
  // PERBAIKAN: Gunakan 'projectId' agar sesuai dengan App.tsx
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { board, isLoading, fetchBoard, moveTaskOptimistic } = useBoardStore();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");

  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    // PERBAIKAN: Panggil fetchBoard dengan projectId
    if (projectId) fetchBoard(projectId);
  }, [projectId, fetchBoard]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        Memuat Board...
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-xl font-bold text-gray-800">Gagal Memuat Board</p>
        <p className="text-gray-500">
          Proyek tidak ditemukan atau terjadi kesalahan server.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const currentUserMember = board.members?.find(
    (m) => m.user.id === currentUserId,
  );
  const isOwner = currentUserMember?.role === "OWNER";
  const handleDragStart = (
    e: React.DragEvent,
    taskId: string,
    sourceStageId: string,
    creatorId: string,
  ) => {
    if (!isOwner && currentUserId !== creatorId) {
      e.preventDefault();
      alert(
        "Hanya pembuat tugas atau Project Owner yang dapat memindahkan tugas ini.",
      );
      return;
    }
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    // PERBAIKAN: Gunakan projectId
    if (!newStageTitle.trim() || !projectId) return;
    try {
      await apiClient.post(`/projects/${projectId}/stages`, {
        title: newStageTitle,
      });
      setNewStageTitle("");
      setIsAddingStage(false);
      fetchBoard(projectId);
    } catch (error) {
      console.error("Gagal menambah kolom", error);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm("Yakin ingin menghapus kolom ini beserta semua isinya?"))
      return;
    try {
      await apiClient.delete(`/projects/stages/${stageId}`);
      // PERBAIKAN: Gunakan projectId
      if (projectId) fetchBoard(projectId);
    } catch (error) {
      console.error("Gagal menghapus kolom", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{board.title}</h1>
            <p className="text-sm text-gray-500">
              {isOwner ? "Role: Project Owner" : "Role: Member"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-6 flex gap-6 items-start">
        {board.stages.map((stage) => (
          <div
            key={stage.id}
            className="w-[320px] shrink-0 bg-gray-100/80 rounded-2xl p-4 flex flex-col max-h-full border border-gray-200/60"
            onDrop={(e) => handleDrop(e, stage.id)}
            onDragOver={handleDragOver}
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-gray-800">
                {stage.title}{" "}
                <span className="text-gray-400 font-normal text-sm ml-1">
                  ({stage.tasks.length})
                </span>
              </h3>
              {isOwner && (
                <button
                  onClick={() => handleDeleteStage(stage.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px] pb-2">
              {stage.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, task.id, stage.id, task.creatorId)
                  }
                  onClick={() => setSelectedTaskId(task.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group"
                >
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">
                    {task.title}
                  </h4>
                  {task.dueDate && (
                    <div className="text-xs font-medium text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded">
                      Deadline:{" "}
                      {new Date(task.dueDate).toLocaleDateString("id-ID")}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedTaskId(`NEW-${stage.id}`)}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Task
            </button>
          </div>
        ))}

        {isOwner && (
          <div className="w-[320px] shrink-0">
            {isAddingStage ? (
              <form
                onSubmit={handleAddStage}
                className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm"
              >
                <input
                  autoFocus
                  type="text"
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  placeholder="Nama kolom..."
                  className="w-full border border-gray-300 rounded-lg p-2 mb-2 text-sm outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingStage(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingStage(true)}
                className="flex items-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <Plus className="w-5 h-5" /> Tambah Kolom
              </button>
            )}
          </div>
        )}
      </div>

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          projectId={projectId!}
          isOwner={isOwner}
          currentUserId={currentUserId}
          members={board.members} // <--- TAMBAHKAN BARIS INI
          onClose={() => {
            setSelectedTaskId(null);
            fetchBoard(projectId!);
          }}
        />
      )}
    </div>
  );
}
