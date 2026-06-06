// src/store/useBoardStore.ts
import { create } from 'zustand';
import { apiClient } from '../api/client';

// 1. Definisikan tipe data sesuai dengan yang dikirim backend
export interface Task {
  id: string;
  title: string;
  assignedTo: string | null;
  stageId: string;
}

export interface Stage {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
}

export interface ProjectBoard {
  id: string;
  title: string;
  stages: Stage[];
}

interface BoardState {
  board: ProjectBoard | null;
  isLoading: boolean;
  fetchBoard: (projectId: string) => Promise<void>;
  moveTaskOptimistic: (taskId: string, sourceStageId: string, destStageId: string) => void;
  addTask: (projectId: string, stageId: string, title: string, dueDate: string) => Promise<void>;
  addStage: (projectId: string, title: string) => Promise<void>;
}

// 2. Buat Store Zustand
export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  isLoading: false,

  // Fungsi untuk memanggil API GET Board yang baru saja kita buat
  fetchBoard: async (projectId) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/projects/${projectId}/board`);
      set({ board: response.data, isLoading: false });
    } catch (error) {
      console.error("Gagal mengambil data board:", error);
      set({ isLoading: false });
    }
  },

  // Fungsi untuk memindahkan kartu di UI secara instan (Optimistic Update)
  moveTaskOptimistic: async (taskId, sourceStageId, destStageId) => {
    // 1. Ubah UI secara instan (Optimistic Update)
    set((state) => {
      if (!state.board) return state;

      const newStages = [...state.board.stages];
      const sourceStageIndex = newStages.findIndex(s => s.id === sourceStageId);
      const destStageIndex = newStages.findIndex(s => s.id === destStageId);

      if (sourceStageIndex === -1 || destStageIndex === -1) return state;

      const taskIndex = newStages[sourceStageIndex].tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return state;

      const [task] = newStages[sourceStageIndex].tasks.splice(taskIndex, 1);
      task.stageId = destStageId;
      newStages[destStageIndex].tasks.push(task);

      return { board: { ...state.board, stages: newStages } };
    });

    // 2. Kirim perubahan ke Backend secara background
    try {
      await apiClient.patch(`/tasks/${taskId}/move`, { newStageId: destStageId });
    } catch (error) {
      console.error("Gagal menyimpan perpindahan tugas ke database:", error);
      // Catatan Arsitektur: Di sistem skala besar, kita harus melakukan "rollback" UI ke posisi awal jika API gagal.
      // Untuk MVP ini, kita cukup log error-nya.
    }
  },

  // Fungsi untuk membuat tugas baru
  addTask: async (projectId: string, stageId: string, title: string, dueDate: string) => {
    try {
      // Tembak API untuk menyimpan ke database
      const response = await apiClient.post('/tasks', { projectId, stageId, title, dueDate });
      
      // Update UI secara instan dengan memasukkan data kembalian dari API
      set((state) => {
        if (!state.board) return state;

        const newStages = [...state.board.stages];
        const stageIndex = newStages.findIndex(s => s.id === stageId);
        
        if (stageIndex !== -1) {
          // Masukkan tugas baru ke dalam daftar tugas di kolom tersebut
          newStages[stageIndex].tasks.push(response.data);
        }

        return { board: { ...state.board, stages: newStages } };
      });
    } catch (error) {
      console.error("Gagal membuat tugas baru:", error);
    }
  },

  // Fungsi untuk menambah kolom baru
  addStage: async (projectId: string, title: string) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/stages`, { title });
      
      set((state) => {
        if (!state.board) return state;
        
        // Gabungkan kolom baru ke array stages yang sudah ada
        const newStages = [...state.board.stages, { ...response.data, tasks: [] }];
        return { board: { ...state.board, stages: newStages } };
      });
    } catch (error) {
      console.error("Gagal menambah kolom:", error);
    }
  },
}));