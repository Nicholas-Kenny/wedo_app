import { create } from "zustand";
import { getProjectBoard, moveTask } from "../api/client";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  creatorId: string;
  assignedTo: string | null;
}

interface Stage {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
}

interface ProjectMember {
  role: string;
  user: { id: string; name: string; email: string };
}

interface BoardData {
  id: string;
  title: string;
  description: string | null;
  stages: Stage[];
  members: ProjectMember[];
}

interface BoardStore {
  board: BoardData | null;
  isLoading: boolean;
  fetchBoard: (projectId: string) => Promise<void>;
  moveTaskOptimistic: (
    taskId: string,
    sourceStageId: string,
    destStageId: string,
  ) => Promise<void>;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  board: null,
  isLoading: true,

  fetchBoard: async (projectId: string) => {
    set({ isLoading: true });
    try {
      const data = await getProjectBoard(projectId);
      set({ board: data, isLoading: false });
    } catch (error) {
      console.error("Gagal memuat board", error);
      set({ isLoading: false });
    }
  },

  moveTaskOptimistic: async (
    taskId: string,
    sourceStageId: string,
    destStageId: string,
  ) => {
    if (sourceStageId === destStageId) return;

    const { board } = get();
    if (!board) return;

    // 1. Lakukan perubahan di UI terlebih dahulu (Optimistic)
    const newStages = board.stages.map((stage) => {
      if (stage.id === sourceStageId) {
        return { ...stage, tasks: stage.tasks.filter((t) => t.id !== taskId) };
      }
      if (stage.id === destStageId) {
        const taskToMove = board.stages
          .find((s) => s.id === sourceStageId)
          ?.tasks.find((t) => t.id === taskId);
        if (taskToMove) {
          return { ...stage, tasks: [...stage.tasks, taskToMove] };
        }
      }
      return stage;
    });

    set({ board: { ...board, stages: newStages } });

    // 2. Panggil API di background
    try {
      await moveTask(taskId, destStageId);
    } catch (error) {
      console.error(
        "Gagal memindahkan task di server, membatalkan perubahan UI",
        error,
      );
      // Jika gagal, kembalikan data dari server (Rollback)
      get().fetchBoard(board.id);
      alert("Anda tidak memiliki akses untuk memindahkan tugas ini.");
    }
  },
}));
