import { useState } from "react";

const defaultTask = {
  title: "",
  description: "",
  priority: "Medium",
  assignee: "Virtual HR",
};

export default function EmployerDashboard({ summary, activityFeed, onCreateTask }) {
  const [form, setForm] = useState(defaultTask);

  const submitTask = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    await onCreateTask({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
    setForm(defaultTask);
  };

  return (
    <section className="card">
      <h2>Employer Dashboard</h2>
      <form className="form-grid" onSubmit={submitTask}>
        <input
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input
          placeholder="Assignee"
          value={form.assignee}
          onChange={(e) => setForm({ ...form, assignee: e.target.value })}
        />
        <button type="submit">Create Task</button>
      </form>

      <div className="summary-grid">
        <StatCard label="Total Tasks" value={summary.total} />
        <StatCard label="Assigned" value={summary.assigned} />
        <StatCard label="In Progress" value={summary.in_progress} />
        <StatCard label="Completed" value={summary.completed} />
        <StatCard label="High Priority" value={summary.high_priority} />
      </div>

      <div>
        <h3>Live Activity Feed</h3>
        <ul className="activity-list">
          {activityFeed.length === 0 && <li>No live activity yet.</li>}
          {activityFeed.map((item, idx) => (
            <li key={`${item.timestamp}-${idx}`}>
              <strong>{new Date(item.timestamp).toLocaleString()}</strong> - {item.message}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p>{label}</p>
      <h3>{value ?? 0}</h3>
    </div>
  );
}
