# Salarite Virtual HR + ATS Assignment

This project implements the Salarite hiring assignment as a mini ATS dashboard with:
- Employer task assignment dashboard
- Virtual HR task execution dashboard
- Interview scheduling module (Voice/Video/Chat)
- Live employer activity feed via WebSockets
- Internal call-room placeholder URLs (`/call-room/{id}`)

## Tech Stack
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React (Vite)
- Realtime: FastAPI WebSocket endpoint

## Project Structure
- `backend/` - FastAPI API, SQLite models, task/interview routes, WebSocket feed
- `frontend/` - React dashboard UI and API/WebSocket integration

## Local Setup

### 1) Backend
From `backend/`:

```bash
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

### 2) Frontend
From `frontend/`:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Demo Credentials
No authentication is required for this assignment build.

## API Highlights
- `POST /api/tasks/` - Create task with priority and assignee
- `PATCH /api/tasks/{id}/status` - Set `In Progress` or `Completed`
- `DELETE /api/tasks/{id}` - Delete a task
- `GET /api/tasks/summary` - Employer summary cards
- `POST /api/interviews/` - Schedule interview with mode and datetime
- `GET /api/interviews/` - List scheduled interviews
- `DELETE /api/interviews/{id}` - Delete an interview
- `POST /api/admin/reset` - Reset all tasks/interviews for a fresh demo
- `WS /ws/activity` - Live activity feed stream

## Assignment Rule Mapping
- Employer assigns tasks and sets priority: implemented in Employer Dashboard
- Virtual HR marks tasks in progress/completed: implemented in Virtual HR Dashboard
- Completion time auto-stored: backend writes `completed_at` on completion
- Interview modes (Voice/Video/Chat): implemented in scheduler form
- Inbuilt call room placeholder: generated as `/call-room/{id}`
- Real-time live monitoring: WebSocket activity feed updates employer panel

## Deployment (Step-by-Step)

### Option 1: Render (recommended)

#### A) Deploy backend on Render
1. Push this project to GitHub.
2. In Render, click **New +** -> **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   - `CORS_ORIGINS=https://<your-frontend-domain>`
6. Click **Create Web Service** and wait for deploy.
7. Verify backend URL:
   - `https://<backend-domain>/api/health`

Note: SQLite file storage on free instances can be ephemeral. For assignment demo this is usually acceptable, but data may reset on redeploy/restart.

#### B) Deploy frontend on Render
1. In Render, click **New +** -> **Static Site**.
2. Connect same GitHub repo.
3. Configure:
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>`
5. Deploy and open frontend URL.

#### C) Final check after deployment
1. Open frontend live URL.
2. Create task, update status, schedule interview.
3. Confirm live feed updates and Swagger works at:
   - `https://<backend-domain>/docs`

### Option 2: Railway (alternative)
1. Create a new project from GitHub repo.
2. Add backend service:
   - Root: `backend`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add frontend service (or deploy frontend on Vercel/Netlify):
   - Root: `frontend`
   - Build: `npm install && npm run build`
4. Set env vars:
   - Frontend: `VITE_API_BASE_URL=<backend-url>`
   - Backend: `CORS_ORIGINS=<frontend-url>`

## Optional Walkthrough Video
Record a short 2-minute demo showing:
- Task creation
- Virtual HR status updates
- Live activity updates
- Interview scheduling and generated call-room URL
