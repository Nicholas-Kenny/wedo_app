// src/pages/Board.tsx
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useBoardStore } from "../store/useBoardStore";
import { GripVertical, Plus } from "lucide-react";
import { useParams } from "react-router-dom";

export default function Board() {
  const { projectId } = useParams();

  // Panggil fungsi addTask yang baru kita buat
  const {
    board,
    isLoading,
    fetchBoard,
    moveTaskOptimistic,
    addTask,
    addStage,
  } = useBoardStore();

  // State untuk melacak kolom mana yang sedang membuka form input
  const [addingToStage, setAddingToStage] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");

  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchBoard(projectId);
    }
  }, [fetchBoard, projectId]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Jika di-drop di luar area kolom, batalkan
    if (!destination) return;

    // Jika di-drop di tempat yang sama persis, batalkan
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // Eksekusi fungsi Zustand untuk memindah kartu
    moveTaskOptimistic(
      draggableId,
      source.droppableId,
      destination.droppableId,
    );
  };

  const handleAddTask = async (stageId: string) => {
    if (!newTaskTitle.trim() || !projectId) return;

    // Panggil fungsi addTask dari store
    await addTask(projectId, stageId, newTaskTitle, newDate);

    // Tutup form dan bersihkan input setelah sukses
    setAddingToStage(null);
    setNewTaskTitle("");
    setNewDate(""); // Reset juga tanggalnya
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        Memuat ruang kerja...
      </div>
    );
  if (!board)
    return (
      <div className="p-10 text-center text-red-500">
        Gagal memuat papan proyek.
      </div>
    );

  return (
    <div className="bg-gray-100 p-8 flex flex-col flex-1">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{board.title}</h1>
        <p className="text-gray-500 mt-1">Ruang Kerja Kanban</p>
      </header>

      {/* Konteks Utama Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 items-start overflow-x-auto pb-4 flex-1">
          {board.stages.map((stage) => (
            /* Area yang bisa menerima jatuhan kartu (Kolom) */
            <Droppable key={stage.id} droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-200/70 p-4 rounded-xl w-80 min-h-[150px] flex flex-col transition-colors ${
                    snapshot.isDraggingOver
                      ? "bg-blue-50/80 ring-2 ring-blue-300"
                      : ""
                  }`}
                >
                  <h3 className="font-bold text-gray-700 mb-4 px-1 flex justify-between items-center">
                    {stage.title}
                    <span className="bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded-full">
                      {stage.tasks.length}
                    </span>
                  </h3>

                  <div className="flex flex-col gap-3 flex-1">
                    {stage.tasks.map((task, index) => (
                      /* Kartu tugas yang bisa ditarik */
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 group flex items-start gap-2 transition-all ${
                              snapshot.isDragging
                                ? "shadow-xl ring-2 ring-blue-500 scale-105 rotate-2"
                                : "hover:shadow-md hover:border-gray-300"
                            }`}
                          >
                            <GripVertical className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab mt-0.5 shrink-0" />
                            <p className="text-sm font-medium text-gray-800 leading-snug">
                              {task.title}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {/* --- MULAI BLOK ADD TASK --- */}
                    {addingToStage === stage.id ? (
                      <div className="mt-3 bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                        {/* Input Tanggal ditambahkan di sini */}
                        <input
                          type="date"
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full text-xs p-2 rounded bg-gray-50 border border-gray-200 mb-2 text-gray-500"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddTask(stage.id)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setAddingToStage(null)}
                            className="text-gray-500 px-3 py-1.5 text-xs font-medium hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingToStage(stage.id)}
                        className="mt-3 flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 w-full text-sm font-medium p-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Tambah Tugas Baru
                      </button>
                    )}
                    {/* --- AKHIR BLOK ADD TASK --- */}
                  </div>
                </div>
              )}
            </Droppable>
          ))}

          {/* --- TOMBOL TAMBAH KOLOM BARU --- */}
          <div className="w-80 shrink-0">
            {isAddingStage ? (
              <div className="bg-gray-200/50 p-4 rounded-xl">
                <input
                  autoFocus
                  placeholder="Nama kolom..."
                  className="w-full p-2 rounded-lg border border-gray-300 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (projectId) addStage(projectId, newStageTitle); // Panggil fungsi store
                      setIsAddingStage(false);
                      setNewStageTitle("");
                    }
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingStage(true)}
                className="bg-gray-200/50 hover:bg-gray-300/50 text-gray-600 w-full p-4 rounded-xl flex items-center gap-2 font-bold transition-all"
              >
                <Plus className="w-5 h-5" /> Tambah Kolom
              </button>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
