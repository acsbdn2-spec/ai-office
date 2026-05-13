import asyncio
from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus
from core.task_manager import Task, TaskManager


class ChiefOfStaff(BaseAgent):
    name = "Chief of Staff"
    role = "Supreme Orchestrator"
    department = "Executive"
    avatar = "👑"
    color = "#f59e0b"
    skills = ["Strategic delegation", "Workflow design", "Cross-team coordination", "Priority setting"]
    system_prompt = """You are the Chief of Staff of a high-performance AI agency.
You are decisive, strategic, and operate like a seasoned C-suite executive.

YOUR RESPONSIBILITIES:
- Receive requests and instantly understand what is truly being asked
- Break down any task into clear, actionable subtasks
- Decide which agent or department handles each subtask
- Set quality expectations and deadlines
- Synthesize all outputs into a single, polished final deliverable
- Hold every agent accountable

AVAILABLE TEAM:
- Manager: Oversees day-to-day execution, assigns and tracks work
- PA (Personal Assistant): Scheduling, formatting, quick drafts, reminders
- Advisor: Risk assessment, recommendations, second opinions
- Strategist: New ideas, innovation, growth plans
- Business Specialist: Market analysis, business plans, client strategy
- Master Coder: All programming languages, automation, system builds
- Legal Head (routes to Legal Department): Contracts, compliance, IP, employment law, corporate law
- Document Agent: Doc conversion, editing, formatting, proofreading
- Design Agent: Posters, visuals, presentations, brand assets
- Telecalling Agent: Call scripts, outreach automation, follow-up sequences
- Data Agent: Client data management, reports, database work

HOW YOU DELEGATE:
1. Greet the task — state what you understand
2. List the subtasks and who handles each
3. Set the tone: "This must be done at the highest standard."
4. Once all results are in, compile and deliver the final output yourself

You speak with authority, clarity, and respect. You never do sloppy work."""

    def __init__(self, bus: MessageBus, task_manager: TaskManager):
        super().__init__(bus)
        self._task_manager = task_manager
        self._pending_results: dict[str, dict] = {}  # task_id -> {agent: result}

    async def handle_user_request(self, request: str) -> str:
        task = self._task_manager.create_task(request)
        task.status = "planning"

        await self.broadcast(
            f"📋 New task received. Analyzing now...",
            msg_type="system",
            task_id=task.id,
        )

        # Chief plans the work
        plan_prompt = f"""User request: {request}

Analyze this request and respond in this EXACT format:

UNDERSTANDING: [1-2 sentences — what the user really needs]

SUBTASKS:
1. [Agent Name]: [What they must do]
2. [Agent Name]: [What they must do]
(add as many as needed)

QUALITY STANDARD: [What excellent output looks like]

FINAL NOTE TO TEAM: [Motivating, clear direction — 1 sentence]"""

        plan = await self.think(plan_prompt)
        task.status = "in_progress"

        await self.say(
            "broadcast",
            f"**Chief of Staff briefing:**\n\n{plan}",
            msg_type="task",
            task_id=task.id,
        )

        # Notify Manager to execute
        await self.say(
            "Manager",
            f"TASK_ID:{task.id}\nUSER REQUEST:{request}\nCHIEF PLAN:\n{plan}",
            msg_type="task",
            task_id=task.id,
        )

        return task.id

    async def compile_final_output(self, task: Task) -> str:
        results_text = "\n\n".join(
            f"[{st.assigned_to}] {st.result}" for st in task.subtasks if st.result
        )
        compile_prompt = f"""Original request: {task.original_request}

All team outputs:
{results_text}

Now compile ONE polished, complete, final deliverable for the user.
Structure it clearly. Include everything useful. Remove duplicates.
This is what the user will receive — make it excellent."""

        final = await self.think(compile_prompt)
        task.final_output = final
        task.status = "done"
        from datetime import datetime
        task.completed_at = datetime.now().isoformat()

        await self.broadcast(
            f"✅ **FINAL DELIVERABLE**\n\n{final}",
            msg_type="result",
            task_id=task.id,
        )
        return final
