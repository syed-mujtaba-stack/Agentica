# Agentica Backend 🧠

Powered by **FastAPI**, this backend serves as the brain of the Agentica platform. It handles multi-agent routing, database persistence, and external API integrations.

## 🛠 Tech Stack
- **Framework**: FastAPI
- **Database**: SQLite (SQLAlchemy)
- **Auth**: OAuth2 with Password + Bearer JWT
- **AI**: OpenRouter API (LLM), Pollinations.ai (Image), Tavily (Search)

## 🔑 Environment Variables
Create a `.env` file in this directory:
```env
OPENROUTER_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🚀 Running Locally
```bash
# 1. Create venv
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# 2. Install Deps
pip install -r requirements.txt

# 3. Run Dev Server
uvicorn main:app --reload
```
Server runs at `http://localhost:8000`.
Docs available at `http://localhost:8000/docs`.

## 📡 Key Endpoints
- `POST /register`: Create account.
- `POST /token`: Login (Get JWT).
- `POST /chat`: Interact with Agents (Nexus, Cipher, etc.).
- `GET /conversations`: Get user history.
- `GET /projects`: Get user projects.
- `GET /users/me`: Get profile stats.
