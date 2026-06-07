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
    set({ isLoading: true, board: null });
    try {
      const data = await getProjectBoard(projectId);
      set({ board: data, isLoading: false });
    } catch (error) {
      console.error("Failed to load board", error);
      set({ isLoading: false, board: null });
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

    try {
      await moveTask(taskId, destStageId);
    } catch (error) {
      console.error(
        "Failed to move task on server, rolling back UI changes",
        error,
      );
      get().fetchBoard(board.id);
      alert("You do not have access to move this task.");
    }
  },
}));
