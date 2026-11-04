# 🎙️ AI Interview Evaluator

An end-to-end full-stack AI-powered technical interview preparation and evaluation platform. It dynamically generates contextual interview questions, evaluates candidate answers in real-time using a local Large Language Model (**Ollama Llama 3.2**), leverages a **Semantic Cache** for ultra-fast evaluations of repeat answers, and provides candidate analytics through an interactive dashboard.

---

## 🌟 Key Features

- **🔐 User Authentication:** Secure registration and login using JWT (JSON Web Tokens) with salted `bcrypt` password hashing.
- **❓ Dynamic Question Generation:** Context-aware interview question generation tailored to candidate experience and target role via Ollama `llama3.2`.
- **⚖️ LLM-as-a-Judge Evaluation:** Automated scoring across multiple dimensions (Accuracy, Technical Depth, Clarity) along with targeted strengths, areas of improvement, and actionable feedback.
- **⚡ Semantic Caching:** High-performance caching layer that intercepts evaluation requests, comparing semantic similarity to return instantaneous evaluations for equivalent responses, drastically cutting LLM latency.
- **📊 Analytics Dashboard:** Overview of total sessions, average scores, semantic cache hit rates, and past performance metrics.
- **📜 Interview History:** Complete record of past interview sessions, questions, candidate submissions, and evaluation breakdowns.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **API Client:** Axios

### **Backend**
- **Framework:** FastAPI (Python 3.10+)
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** Python-Jose (JWT), Passlib (Bcrypt)
- **Data Validation:** Pydantic v2

### **AI & Machine Learning**
- **LLM Engine:** Ollama running `llama3.2` locally
- **Optimization:** In-memory Semantic Cache for response evaluation

---

## 📁 Project Structure

\`\`\`text
ai-interview-evaluator/
├── backend/
│   ├── app/
│   │   ├── routers/        # API route handlers (auth, interview)
│   │   ├── services/       # Ollama LLM service & Semantic Cache
│   │   ├── auth.py         # JWT tokens & password hashing
│   │   ├── config.py       # App configuration
│   │   ├── database.py     # SQLite connection & session
│   │   ├── models.py       # SQLAlchemy DB entities
│   │   └── schemas.py      # Pydantic validation schemas
│   ├── main.py             # FastAPI entrypoint
│   └── requirement.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/     # UI components (Navbar, etc.)
    │   ├── context/        # Auth Context state
    │   ├── pages/          # Dashboard, Interview, History, Auth pages
    │   └── services/       # Axios API client
    ├── index.html
    ├── package.json
    └── tailwind.config.js
\`\`\`

---

## 🚀 Getting Started

### Prerequisites
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js (LTS)](https://nodejs.org/)
- [Ollama](https://ollama.com/)

---

### 1. Setup AI Model (Ollama)
Download and run the Llama 3.2 model locally:
\`\`\`bash
ollama pull llama3.2
ollama run llama3.2
\`\`\`
*(Ensure Ollama is running at `http://localhost:11434`)*.

---

### 2. Backend Setup (FastAPI)
\`\`\`bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows PowerShell
# source venv/bin/activate     # On Linux/macOS

# Install dependencies
pip install -r requirement.txt

# Run server
uvicorn main:app --reload --port 8000
\`\`\`
Backend Swagger API Docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Frontend Setup (React + Tailwind)
In a new terminal:
\`\`\`bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
\`\`\`
The application will launch at: [http://localhost:5173](http://localhost:5173)

---

## 🔒 Security & Best Practices
- Passwords are encrypted with `bcrypt` before storage.
- Private endpoints require a valid Bearer JWT.
- CORS policy restricts unverified origins in production.
- Model prompts are structured for strict JSON output parsing.

Screenshots:
<img width="1859" height="793" alt="Image" src="https://github.com/user-attachments/assets/2728e50f-c011-48e0-aea1-38dad023b4e5" />
<img width="1779" height="842" alt="Image" src="https://github.com/user-attachments/assets/26cc87e7-b612-4958-a45e-09abc92775ea" />
<img width="1803" height="859" alt="Image" src="https://github.com/user-attachments/assets/413f11e9-0a21-4dd0-9422-acbea886c71d" />
<img width="1811" height="852" alt="Image" src="https://github.com/user-attachments/assets/1b91d7f2-fede-4e86-b346-8a397b568c22" />
