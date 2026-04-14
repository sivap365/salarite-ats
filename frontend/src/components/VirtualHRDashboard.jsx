export default function VirtualHRDashboard({ tasks, onUpdateTaskStatus }) {
  return (
    <section className="card">
      <h2>Virtual HR Dashboard</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Completed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan="5">No assigned tasks yet.</td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  <div>{task.description || "-"}</div>
                </td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td>{task.completed_at ? new Date(task.completed_at).toLocaleString() : "-"}</td>
                <td className="actions">
                  <button
                    onClick={() => onUpdateTaskStatus(task.id, "In Progress")}
                    disabled={task.status !== "Assigned"}
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => onUpdateTaskStatus(task.id, "Completed")}
                    disabled={task.status === "Completed"}
                  >
                    Mark Completed
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
