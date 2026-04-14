import { useState } from "react";

const defaultForm = {
  candidate_name: "",
  scheduled_at: "",
  mode: "Voice Call",
};

export default function InterviewScheduler({ interviews, onCreateInterview }) {
  const [form, setForm] = useState(defaultForm);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.candidate_name || !form.scheduled_at) return;

    await onCreateInterview(form);
    setForm(defaultForm);
  };

  return (
    <section className="card">
      <h2>Interview Scheduling</h2>
      <form className="form-grid" onSubmit={submit}>
        <input
          placeholder="Candidate Name"
          value={form.candidate_name}
          onChange={(e) => setForm({ ...form, candidate_name: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          value={form.scheduled_at}
          onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
          required
        />
        <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
          <option>Voice Call</option>
          <option>Video Call</option>
          <option>Chat Interview</option>
        </select>
        <button type="submit">Schedule Interview</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Date & Time</th>
              <th>Mode</th>
              <th>Call Room</th>
            </tr>
          </thead>
          <tbody>
            {interviews.length === 0 && (
              <tr>
                <td colSpan="4">No interviews scheduled yet.</td>
              </tr>
            )}
            {interviews.map((item) => (
              <tr key={item.id}>
                <td>{item.candidate_name}</td>
                <td>{new Date(item.scheduled_at).toLocaleString()}</td>
                <td>{item.mode}</td>
                <td>
                  <code>{item.call_room_url}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
