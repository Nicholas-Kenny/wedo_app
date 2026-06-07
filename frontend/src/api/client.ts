import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000",
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const getDashboardSummary = async () => {
  const response = await apiClient.get("/dashboard");
  return response.data;
};

export const createProject = async (data: {
  title: string;
  description?: string;
  customStages?: string[];
}) => {
  const response = await apiClient.post("/projects", data);
  return response.data;
};

export const getUserProjects = async () => {
  const response = await apiClient.get("/projects");
  return response.data;
};

export const getProjectBoard = async (projectId: string) => {
  const response = await apiClient.get(`/projects/${projectId}`);
  return response.data;
};

export const inviteMember = async (projectId: string, email: string) => {
  const response = await apiClient.post(`/projects/${projectId}/invite`, {
    email,
  });
  return response.data;
};

export const acceptInvitation = async (projectId: string) => {
  const response = await apiClient.patch(`/projects/${projectId}/accept`);
  return response.data;
};

export const createTask = async (data: {
  projectId: string;
  stageId: string;
  title: string;
  dueDate?: string;
}) => {
  const response = await apiClient.post("/tasks", data);
  return response.data;
};

export const updateTask = async (taskId: string, data: any) => {
  const response = await apiClient.patch(`/tasks/${taskId}`, data);
  return response.data;
};

export const moveTask = async (taskId: string, newStageId: string) => {
  const response = await apiClient.patch(`/tasks/${taskId}/move`, {
    newStageId,
  });
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

export const deleteProject = async (projectId: string) => {
  const response = await apiClient.delete(`/projects/${projectId}`);
  return response.data;
};