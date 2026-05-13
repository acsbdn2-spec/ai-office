import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from core.message_bus import Message, MessageBus
from core.task_manager import TaskManager

from agents.chief_of_staff import ChiefOfStaff
from agents.manager import Manager
from agents.pa import PA
from agents.advisor import Advisor
from agents.strategist import Strategist
from agents.business_specialist import BusinessSpecialist
from agents.coder import MasterCoder
from agents.legal.legal_head import LegalHead
from agents.legal.contract_specialist import ContractSpecialist
from agents.legal.compliance_officer import ComplianceOfficer
from agents.legal.ip_specialist import IPSpecialist
from agents.legal.employment_law import EmploymentLawSpecialist
from agents.legal.corporate_law import CorporateLawSpecialist
from agents.specialists.document_agent import DocumentAgent
from agents.specialists.design_agent import DesignAgent
from agents.specialists.telecalling_agent import TelecallingAgent
from agents.specialists.data_agent import DataAgent

app = FastAPI(title="Office AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Bootstrap ─────────────────────────────────────────────────────────────────

bus = MessageBus()
task_manager = TaskManager()

# Instantiate all agents
legal_juniors = {}
all_agents: dict = {}

pa = PA(bus)
advisor = Advisor(bus)
strategist = Strategist(bus)
business = BusinessSpecialist(bus)
coder = MasterCoder(bus)
doc_agent = DocumentAgent(bus)
design_agent = DesignAgent(bus)
telecalling_agent = TelecallingAgent(bus)
data_agent = DataAgent(bus)

contract_specialist = ContractSpecialist(bus)
compliance_officer = ComplianceOfficer(bus)
ip_specialist = IPSpecialist(bus)
employment_law = EmploymentLawSpecialist(bus)
corporate_law = CorporateLawSpecialist(bus)

legal_juniors = {
    "Contract Specialist": contract_specialist,
    "Compliance Officer": compliance_officer,
    "IP Specialist": ip_specialist,
    "Employment Law Specialist": employment_law,
    "Corporate Law Specialist": corporate_law,
}

legal_head = LegalHead(bus, task_manager, legal_juniors)

all_agents = {
    "PA": pa,
    "Advisor": advisor,
    "Strategist": strategist,
    "Business Specialist": business,
    "Master Coder": coder,
    "Legal Head": legal_head,
    "Document Agent": doc_agent,
    "Design Agent": design_agent,
    "Telecalling Agent": telecalling_agent,
    "Data Agent": data_agent,
    **legal_juniors,
}

manager = Manager(bus, task_manager, {**all_agents})
all_agents["Manager"] = manager

chief = ChiefOfStaff(bus, task_manager)
all_agents["Chief of Staff"] = chief
manager._agents["Chief of Staff"] = chief

# ── WebSocket broadcaster ──────────────────────────────────────────────────────

connected_clients: list[WebSocket] = []


async def broadcast_to_clients(message: Message):
    dead = []
    for ws in connected_clients:
        try:
            await ws.send_text(json.dumps(message.to_dict()))
        except Exception:
            dead.append(ws)
    for ws in dead:
        connected_clients.remove(ws)


bus.on_any_message(broadcast_to_clients)

# ── API Routes ────────────────────────────────────────────────────────────────


class TaskRequest(BaseModel):
    message: str


@app.post("/api/task")
async def submit_task(req: TaskRequest):
    task_id = await chief.handle_user_request(req.message)
    return {"task_id": task_id, "status": "started"}


@app.get("/api/agents")
async def get_agents():
    agents_list = []
    for name, agent in all_agents.items():
        info = agent.agent_info()
        agents_list.append(info)
    return {"agents": agents_list}


@app.get("/api/tasks")
async def get_tasks():
    return {"tasks": [t.to_dict() for t in task_manager.all_tasks()]}


@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str):
    task = task_manager.get_task(task_id)
    if not task:
        return {"error": "Not found"}
    return task.to_dict()


@app.get("/api/messages")
async def get_messages():
    return {"messages": [m.to_dict() for m in bus.history[-100:]]}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)

    # Send history on connect
    for msg in bus.history[-50:]:
        try:
            await websocket.send_text(json.dumps(msg.to_dict()))
        except Exception:
            break

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)


@app.get("/api/health")
async def health():
    return {"status": "ok", "agents": len(all_agents)}
