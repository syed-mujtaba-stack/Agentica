from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import List, Optional
from sqlalchemy.orm import Session
from auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import models, database
from jose import JWTError, jwt
import auth

load_dotenv()

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Agent System Prompts ---
NEXUS_System = "You are Nexus, a general-purpose AI assistant. Helpful, concise, and conversational. The 'default' interface."
CIPHER_System = "You are Cipher, an elite coding expert. Specialize in architecture, optimization, and debugging. Response Style: Technical, precise, no fluff."
ZENITH_System = "You are Zenith, a creative visionary. Specialize in storytelling, poetry, and ideation. Use evocative language and rich imagery."
APEX_System = "You are Apex, a business and strategy consultant. Specialize in startups, marketing, finance, and leadership. Tone: Professional, ambitious, strategic."
VORTEX_System = "You are Vortex, a scientific researcher. Specialize in physics, biology, chemistry, and academic research. Tone: Analytical, objective, detailed."
NOVA_System = "You are Nova, an educational tutor. Specialize in explaining complex topics simply. Tone: Patient, encouraging, clear."
ECHO_System = "You are Echo, a historian and philosopher. Specialize in past events, cultural analysis, and philosophical debate. Tone: Reflective, wise."
ORBIT_System = "You are Orbit, a travel and culture guide. Specialize in geography, languages, and travel planning. Tone: Adventurous, worldly."
FLUX_System = "You are Flux, a critical analyst. Specialize in debates, reviewing arguments, and spotting logical fallacies. Tone: Skeptical, sharp, balanced."
SPARK_System = "You are Spark, a technical support specialist. Specialize in troubleshooting hardware/software and step-by-step guides. Tone: Helpful, patient."
RIFT_System = "You are Rift, a cybersecurity expert. Specialize in ethical hacking, network security, and digital privacy. Tone: Cautious, authoritative."
PULSE_System = "You are Pulse, a health and wellness coach. Specialize in fitness, nutrition, and mental well-being advice. Tone: Energetic, supportive. (Disclaimer: Not a doctor)."
VERTEX_System = "You are Vertex, a mathematician and logician. Specialize in solving math problems and logic puzzles. Tone: Precise, formal."

ROUTER_System = """You are the Central Router. Classify the user's intent into ONE of these categories:
1. 'CIPHER' - Coding, programming, debugging.
2. 'ZENITH' - Creative writing, stories, poems.
3. 'APEX' - Business, strategy, finance.
4. 'VORTEX' - Science, research, academic.
5. 'NOVA' - Learning, explanations, tutoring.
6. 'ECHO' - History, philosophy.
7. 'ORBIT' - Travel, culture, languages.
8. 'FLUX' - Debates, logic checks, analysis.
9. 'SPARK' - Tech support, troubleshooting.
10. 'RIFT' - Cybersecurity, hacking (ethical).
11. 'PULSE' - Health, fitness, wellness.
12. 'VERTEX' - Math, logic puzzles.
13. 'NEXUS' - General, greetings, everything else.

Output ONLY the agent name (e.g., 'CIPHER')."""

# Initialize OpenAI client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Initialize Tavily client
tavily_client = None
if os.getenv("TAVILY_API_KEY"):
    from tavily import TavilyClient
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    use_search: bool = False

class MessageSchema(BaseModel):
    role: str
    content: str
    agent: str

class ConversationSchema(BaseModel):
    id: int
    title: str
    messages: List[MessageSchema] = []

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# ... (Previous schemas) ...

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ... (Existing prompts) ...

@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

class ProjectCreate(BaseModel):
    title: str
    description: str = None

@app.post("/projects")
def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_project = models.Project(title=project.title, description=project.description, user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects")
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

@app.get("/users/me")
def read_users_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conversation_count = db.query(models.Conversation).filter(models.Conversation.user_id == current_user.id).count()
    message_count = db.query(models.Message).join(models.Conversation).filter(models.Conversation.user_id == current_user.id).count()
    
    return {
        "email": current_user.email,
        "id": current_user.id,
        "conversation_count": conversation_count,
        "message_count": message_count,
        "joined_at": "2024" # In a real app we'd have created_at on User
    }

@app.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Return user's conversations
    return db.query(models.Conversation).filter(models.Conversation.user_id == current_user.id).order_by(models.Conversation.created_at.desc()).limit(20).all()

@app.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@app.post("/chat")
def chat_endpoint(
    request: ChatRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if not os.getenv("OPENROUTER_API_KEY"):
         raise HTTPException(status_code=500, detail="OpenRouter API Key not configured")

    # Get or create conversation (ensure it belongs to user)
    if request.conversation_id:
        conversation = db.query(models.Conversation).filter(
            models.Conversation.id == request.conversation_id,
            models.Conversation.user_id == current_user.id
        ).first()
        if not conversation: # Should ideally start new if not found, or error
             # Logic: if ID provided but not found/owned, start NEW conversation
             conversation = models.Conversation(title=request.message[:30] + "...", user_id=current_user.id)
             db.add(conversation)
             db.commit()
             db.refresh(conversation)
    else:
        conversation = models.Conversation(title=request.message[:30] + "...", user_id=current_user.id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save User Message
    user_msg = models.Message(conversation_id=conversation.id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    try:
        # Step 1: Route
        router_response = client.chat.completions.create(
            model="meta-llama/llama-3.3-70b-instruct:free",
            messages=[{"role": "system", "content": ROUTER_System}, {"role": "user", "content": request.message}],
            temperature=0.1,
            max_tokens=10
        )
        selected_agent = router_response.choices[0].message.content.strip().upper()
        
        valid_agents = ["CIPHER", "ZENITH", "APEX", "VORTEX", "NOVA", "ECHO", "ORBIT", "FLUX", "SPARK", "RIFT", "PULSE", "VERTEX", "NEXUS"]
        if selected_agent not in valid_agents: selected_agent = "NEXUS"

        # Step 2: Select Prompt
        prompts = {
            "CIPHER": CIPHER_System, "ZENITH": ZENITH_System, "APEX": APEX_System,
            "VORTEX": VORTEX_System, "NOVA": NOVA_System, "ECHO": ECHO_System,
            "ORBIT": ORBIT_System, "FLUX": FLUX_System, "SPARK": SPARK_System,
            "RIFT": RIFT_System, "PULSE": PULSE_System, "VERTEX": VERTEX_System,
            "NEXUS": NEXUS_System
        }
        system_prompt = prompts.get(selected_agent, NEXUS_System)

        # Step 3: Search (Optional)
        search_context = ""
        if request.use_search and tavily_client:
            try:
                search_result = tavily_client.get_search_context(query=request.message, search_depth="basic", max_results=3)
                search_context = f"\n\n[REAL-TIME SEARCH CONTEXT]:\n{search_result}\n\n[INSTRUCTION]: Use the above context to answer the user's question accurately."
            except Exception as e:
                print(f"Search failed: {e}")
                search_context = "\n\n[System]: Search failed, answering based on knowledge."

        # Step 4: Generate
        final_system_prompt = system_prompt + search_context

        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": os.getenv("site_url", "http://localhost:3000"), 
                "X-Title": os.getenv("site_name", "Agentica"),
            },
            model="meta-llama/llama-3.3-70b-instruct:free",
            messages=[
                {"role": "system", "content": final_system_prompt},
                {"role": "user", "content": request.message},
            ],
        )
        
        response_content = completion.choices[0].message.content
        
        # Save AI Message
        ai_msg = models.Message(
            conversation_id=conversation.id, 
            role="assistant", 
            content=response_content,
            agent=selected_agent
        )
        db.add(ai_msg)
        db.commit()

        return {
            "response": response_content,
            "agent": selected_agent,
            "conversation_id": conversation.id
        }

    except Exception as e:
        print(f"Error calling OpenRouter: {e}")
        raise HTTPException(status_code=500, detail=str(e))
