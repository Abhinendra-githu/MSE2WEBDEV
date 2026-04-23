# Student Grievance Management System

A full-stack MERN application for students to submit and manage their grievances, featuring JWT authentication, a modern UI, and comprehensive CRUD & search capabilities.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT & bcrypt

## Project Structure
```text
student-grievance-system/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route logic (auth & grievance)
│   ├── middleware/      # JWT verification
│   ├── models/          # Mongoose Schemas (Student, Grievance)
│   ├── routes/          # Express API routes
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, ProtectedRoute
    │   ├── context/     # AuthContext for global state
    │   ├── pages/       # Login, Register, Dashboard
    │   ├── App.jsx      # React Router config
    │   ├── index.css    # Premium CSS styles
    │   └── main.jsx     # React entry point
    └── .env             # Frontend Environment variables
```

## Setup & Running Locally

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `backend/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/student-grievance-system
   PORT=5000
   JWT_SECRET=supersecretjwtkey12345
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Deployment to Render

### Backend Deployment
1. Push your code to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `backend` (if you deploy from a monorepo) or leave empty if the repo is just the backend.
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
   - `PORT`: (Render will assign this automatically, but you can set it).

### Frontend Deployment
1. Go to Render and create a new **Static Site**.
2. Connect your GitHub repository.
3. Set the Root Directory to `frontend`.
4. Build Command: `npm run build`
5. Publish Directory: `dist`
6. Add Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-backend.onrender.com/api`).
7. **Important**: Since we are using React Router, you need to set up rewrite rules in Render (Redirects/Rewrites) to redirect all 404 requests to `index.html`.

## API Documentation

### Authentication
- `POST /api/register`: Register a new student (`name`, `email`, `password`)
- `POST /api/login`: Authenticate and get JWT (`email`, `password`)

### Grievances (Requires Bearer Token)
- `POST /api/grievances`: Create a grievance (`title`, `description`, `category`)
- `GET /api/grievances`: Get all grievances for logged-in user
- `GET /api/grievances/:id`: Get a specific grievance by ID
- `PUT /api/grievances/:id`: Update a grievance
- `DELETE /api/grievances/:id`: Delete a grievance
- `GET /api/grievances/search?title=xyz`: Search grievances by title
