import { useEffect, useMemo, useState } from "react";
import {
  createInterview,
  createTask,
  getTaskSummary,
  getWsUrl,
  listInterviews,
  listTasks,
  updateTaskStatus,
} from "./api/client";
import EmployerDashboard from "./components/EmployerDashboard";
import InterviewScheduler from "./components/InterviewScheduler";
import VirtualHRDashboard from "./components/VirtualHRDashboard";
import "./App.css";

const initialSummary = {
  total: 0,
  assigned: 0,
  in_progress: 0,
  completed: 0,
  high_priority: 0,
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [summary, setSummary] = useState(initialSummary);
  const [activityFeed, setActivityFeed] = useState([]);
  const [error, setError] = useState("");

  const sortedActivities = useMemo(
    () =>
      [...activityFeed]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20),
    [activityFeed],
  );

  const loadDashboard = async () => {
    try {
      const [taskData, summaryData, interviewData] = await Promise.all([
        listTasks(),
        getTaskSummary(),
        listInterviews(),
      ]);
      setTasks(taskData);
      setSummary(summaryData);
      setInterviews(interviewData);
      setError("");
    } catch {
      setError("Unable to load dashboard data. Ensure backend is running.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(getWsUrl());
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.type === "history") {
        setActivityFeed(parsed.data ?? []);
      }
      if (parsed.type === "event") {
        setActivityFeed((current) => [...current, parsed.data]);
        loadDashboard();
      }
    };

    ws.onerror = () => {
      setError("Live feed disconnected. Check backend WebSocket endpoint.");
    };

    const keepAlive = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 15000);

    return () => {
      clearInterval(keepAlive);
      ws.close();
    };
  }, []);

  const handleCreateTask = async (payload) => {
    await createTask(payload);
    await loadDashboard();
  };

  const handleStatusUpdate = async (taskId, status) => {
    await updateTaskStatus(taskId, status);
    await loadDashboard();
  };

  const handleCreateInterview = async (payload) => {
    // datetime-local input is local time, convert to ISO for API consistency.
    const isoDate = new Date(payload.scheduled_at).toISOString();
    await createInterview({ ...payload, scheduled_at: isoDate });
    await loadDashboard();
  };

  return (
    <main className="page">
      <header>
        <h1>Salarite Virtual HR + ATS Dashboard</h1>
        <p>Employer assignment, virtual HR execution, and live interview scheduling.</p>
      </header>
      {error && <p className="error">{error}</p>}
      <EmployerDashboard summary={summary} activityFeed={sortedActivities} onCreateTask={handleCreateTask} />
      <VirtualHRDashboard tasks={tasks} onUpdateTaskStatus={handleStatusUpdate} />
      <InterviewScheduler interviews={interviews} onCreateInterview={handleCreateInterview} />
    </main>
  );
}

export default App;
