# Agentica: The Next-Gen AI Squad Platform ⚡️

![Agentica Banner](https://img.shields.io/badge/Agentica-v2.0-blueviolet?style=for-the-badge&logo=openai)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge)

**Agentica** is an advanced, multi-agent collaboration platform designed to solve complex problems through specialized AI personas. Built with a modern tech stack, it features real-time voice interaction, deep web search, image generation, and a secure workspace for managing projects.

## 🚀 Key Features

### 🤖 The 13-Agent Squad
Access a roster of specialized agents, each with unique system prompts and capabilities:
- **Nexus** (Generalist), **Cipher** (Coding), **Zenith** (Creative), **Apex** (Business)
- **Vortex** (Science), **Nova** (Education), **Echo** (History), **Orbit** (Travel)
- **Flux** (Debate), **Spark** (Support), **Rift** (Security), **Pulse** (Health), **Vertex** (Math)

### 🛠 Core Capabilities
- **Multi-Modal Interaction**: Voice-to-Text and Text-to-Speech (TTS) enabled.
- **Deep Search**: Integrated Tavily API for real-time web browsing and citations.
- **Imagine Mode**: Instant AI image generation powered by Pollinations.ai.
- **Project Structure**: Organize conversations into named Projects for better workflow.
- **Secure Auth**: User registration, login, and private conversation history (JWT-based).

## 🏗 Architecture

The project is a monorepo divided into two main components:

### 1. Frontend (`/client`)
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS + Framer Motion (Animations)
- **State**: React Hooks + Local Storage
- **Features**: Glassmorphism UI, Responsive Design, Real-time Chat Interface.

### 2. Backend (`/server`)
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **AI Engine**: OpenRouter (LLM Proxy) + Tavily (Search)
- **Authentication**: OAuth2 + JWT (Passlib/Jose)

## ⚡️ Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- API Keys: `OPENROUTER_API_KEY`, `TAVILY_API_KEY`, `SECRET_KEY`

### 1. Backend Setup
```bash
cd server
python -m venv .venv
# Activate venv (Windows: .venv\Scripts\activate, Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
# Copy example env and fill keys
cp .env.example .env
# Run Server
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd client
npm install
# Run Client
npm run dev
```

Visit `http://localhost:3000` to launch the application.

## 📂 Project Structure

```
web-builder/
├── client/          # Next.js Frontend
│   ├── app/         # Pages (Login, Profile, Projects, Imagine)
│   ├── components/  # UI Components (Sidebar, Chat, MessageBubble)
│   └── lib/         # Utilities (Sounds, API)
├── server/          # FastAPI Backend
│   ├── main.py      # Entry point & API Routes
│   ├── models.py    # Database Models (User, Project, Conversation)
│   ├── auth.py      # Authentication Logic
│   └── agentica.db  # SQLite Database
```

## 🤝 Contributing
Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
