import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string | null;
  stageId: string | null;
  dueDate: string | null;
}

export interface Stage {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
}

export interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export interface ProjectBoard {
  id: string;
  title: string;
  stages: Stage[];
  members: Member[];
}

interface BoardState {
  board: ProjectBoard | null;
  isLoading: boolean;
  selectedTaskId: string | null;

  fetchBoard: (projectId: string) => Promise<void>;
  moveTaskOptimistic: (taskId: string, sourceStageId: string, destStageId: string) => void;
  addTask: (projectId: string, stageId: string, title: string, dueDate: string) => Promise<void>;
  addStage: (projectId: string, title: string) => Promise<void>;
  deleteStage: (projectId: string, stageId: string) => Promise<void>;

  openTask: (taskId: string) => void;
  closeTask: () => void;
  updateTaskInStore: (taskId: string, data: Partial<Task>) => void;
  deleteTaskFromStore: (taskId: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  isLoading: false,
  selectedTaskId: null,

  fetchBoard: async (projectId) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/projects/${projectId}/board`);
      set({ board: response.data, isLoading: false });
    } catch (error) {
      console.error('Gagal mengambil data board:', error);
      set({ isLoading: false });
    }
  },

  moveTaskOptimistic: async (taskId, sourceStageId, destStageId) => {
    // Optimistic update — ubah UI instan
    set((state) => {
      if (!state.board) return state;
      const newStages = state.board.stages.map((s) => ({ ...s, tasks: [...s.tasks] }));
      const srcIdx = newStages.findIndex((s) => s.id === sourceStageId);
      const dstIdx = newStages.findIndex((s) => s.id === destStageId);
      if (srcIdx === -1 || dstIdx === -1) return state;

      const taskIdx = newStages[srcIdx].tasks.findIndex((t) => t.id === taskId);
      if (taskIdx === -1) return state;

      const [task] = newStages[srcIdx].tasks.splice(taskIdx, 1);
      task.stageId = destStageId;
      newStages[dstIdx].tasks.push(task);

      return { board: { ...state.board, stages: newStages } };
    });

    try {
      await apiClient.patch(`/tasks/${taskId}/move`, { newStageId: destStageId });
    } catch (error) {
      console.error('Gagal menyimpan perpindahan task:', error);
    }
  },

  addTask: async (projectId, stageId, title, dueDate) => {
    try {
      const response = await apiClient.post('/tasks', {
        projectId,
        stageId,
        title,
        dueDate: dueDate || undefined,
      });

      set((state) => {
        if (!state.board) return state;
        const newStages = state.board.stages.map((s) =>
          s.id === stageId ? { ...s, tasks: [...s.tasks, response.data] } : s
        );
        return { board: { ...state.board, stages: newStages } };
      });
    } catch (error) {
      console.error('Gagal membuat task:', error);
    }
  },

  addStage: async (projectId, title) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/stages`, { title });
      set((state) => {
        if (!state.board) return state;
        return {
          board: {
            ...state.board,
            stages: [...state.board.stages, { ...response.data, tasks: [] }],
          },
        };
      });
    } catch (error) {
      console.error('Gagal menambah kolom:', error);
    }
  },

  deleteStage: async (projectId, stageId) => {
    try {
      await apiClient.delete(`/projects/${projectId}/stages/${stageId}`);
      set((state) => {
        if (!state.board) return state;
        return {
          board: {
            ...state.board,
            stages: state.board.stages.filter((s) => s.id !== stageId),
          },
        };
      });
    } catch (error) {
      console.error('Gagal menghapus kolom:', error);
    }
  },

  openTask: (taskId) => set({ selectedTaskId: taskId }),
  closeTask: () => set({ selectedTaskId: null }),

  updateTaskInStore: (taskId, data) => {
    set((state) => {
      if (!state.board) return state;
      const newStages = state.board.stages.map((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
      }));
      return { board: { ...state.board, stages: newStages } };
    });
  },

  deleteTaskFromStore: (taskId) => {
    set((state) => {
      if (!state.board) return state;
      const newStages = state.board.stages.map((s) => ({
        ...s,
        tasks: s.tasks.filter((t) => t.id !== taskId),
      }));
      return { board: { ...state.board, stages: newStages } };
    });
  },
}));