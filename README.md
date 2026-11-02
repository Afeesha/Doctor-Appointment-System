# CareSlot - Doctor Appointment System (MERN)

Folders: `backend/` (Express + MongoDB) and `frontend/` (React + Vite).
Roles: **patient** (search doctors, book/cancel) and **doctor** (confirm, complete, cancel).

## Run locally
Requirements: Node.js 18+ and MongoDB (local) or a free MongoDB Atlas cluster.

```bash
# Terminal 1 - backend
cd backend
npm install
# edit .env if you use Atlas (MONGO_URI) - default is local MongoDB
npm run seed      # optional demo data (password for all demo users: password123)
npm run dev       # http://localhost:5000

# Terminal 2 - frontend
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Demo logins after seeding: `patient@demo.com`, `ananya@demo.com` (doctor), password `password123`.

## Deploy (all free tiers)
1. **MongoDB Atlas**: create a free cluster -> Database Access: add a user -> Network Access: allow `0.0.0.0/0` -> Connect -> copy the connection string and add the database name, e.g. `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/doctor-appointment`.
2. **Push to GitHub**: in this folder run `git init && git add . && git commit -m "init"`, create a GitHub repo, then `git branch -M main && git remote add origin <url> && git push -u origin main`.
3. **Backend on Render** (New -> Web Service -> your repo):
   - Root Directory: `backend` | Build Command: `npm install` | Start Command: `npm start`
   - Environment variables: `MONGO_URI`, `JWT_SECRET` (any long random string), `CLIENT_URL` (set after step 4)
   - Copy the service URL, e.g. `https://careslot-api.onrender.com`
4. **Frontend on Vercel** (Add New Project -> your repo):
   - Root Directory: `frontend` | Framework: Vite
   - Environment variable: `VITE_API_URL` = `https://careslot-api.onrender.com/api`
   - Deploy and copy the Vercel URL.
5. In Render, set `CLIENT_URL` to the Vercel URL (no trailing slash) and redeploy.
6. Optional: seed Atlas once from your machine by putting the Atlas URI in `backend/.env` and running `npm run seed`.

Render's free tier sleeps when idle, so the first request after a pause can take ~50 seconds.

## API
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/doctors?q=&specialization=`, `GET /api/doctors/specializations`, `GET /api/doctors/:id/slots?date=YYYY-MM-DD`
- `POST /api/appointments`, `GET /api/appointments/mine`, `PATCH /api/appointments/:id/status`
