const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function getWsUrl() {
  return API_BASE_URL.replace("http://", "ws://").replace("https://", "wss://") + "/ws/activity";
}

export function listTasks() {
  return request("/api/tasks/");
}

export function createTask(payload) {
  return request("/api/tasks/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTaskStatus(taskId, status) {
  return request(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getTaskSummary() {
  return request("/api/tasks/summary");
}

export function listInterviews() {
  return request("/api/interviews/");
}

export function createInterview(payload) {
  return request("/api/interviews/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
