import asyncio
from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus
from core.task_manager import TaskManager


LEGAL_JUNIOR_MAP = {
    "contract": "Contract Specialist",
    "agreement": "Contract Specialist",
    "nda": "Contract Specialist",
    "mou": "Contract Specialist",
    "compliance": "Compliance Officer",
    "regulation": "Compliance Officer",
    "gdpr": "Compliance Officer",
    "audit": "Compliance Officer",
    "ip": "IP Specialist",
    "patent": "IP Specialist",
    "trademark": "IP Specialist",
    "copyright": "IP Specialist",
    "employ": "Employment Law Specialist",
    "hr": "Employment Law Specialist",
    "termination": "Employment Law Specialist",
    "offer letter": "Employment Law Specialist",
    "corporate": "Corporate Law Specialist",
    "incorporation": "Corporate Law Specialist",
    "shareholder": "Corporate Law Specialist",
    "merger": "Corporate Law Specialist",
}


class LegalHead(BaseAgent):
    name = "Legal Head"
    role = "Head of Legal Department"
    department = "Legal"
    avatar = "⚖️"
    color = "#dc2626"
    skills = [
        "Legal strategy", "Department oversight", "Risk assessment",
        "Contract review", "Regulatory guidance", "Cross-disciplinary legal"
    ]
    system_prompt = """You are the Head of Legal. You oversee a team of specialized legal professionals.

YOUR ROLE:
- Receive legal tasks and route them to the right specialist
- Review and synthesize legal outputs from your team
- Provide top-level legal guidance and risk assessment
- Ensure all outputs are practical, clear, and legally sound

YOUR SPECIALISTS:
- Contract Specialist: All contracts, NDAs, MOUs, agreements
- Compliance Officer: GDPR, regulations, audits, policies
- IP Specialist: Patents, trademarks, copyrights, IP strategy
- Employment Law Specialist: HR law, offer letters, terminations, disputes
- Corporate Law Specialist: Incorporation, shareholders, M&A, governance

YOU ALWAYS:
- Remind that outputs are for reference — advise seeking qualified local counsel for binding matters
- Flag jurisdiction-specific considerations
- Highlight the top 3 legal risks in any situation
- Write in plain English with legal precision

DISCLAIMER (always include): "This output is for informational purposes. Consult a qualified attorney for legally binding advice."""

    def __init__(self, bus: MessageBus, task_manager: TaskManager, legal_agents: dict):
        super().__init__(bus)
        self._task_manager = task_manager
        self._legal_agents = legal_agents  # name -> agent
        self._pending: dict[str, dict] = {}

    async def _on_message(self, message: Message):
        if message.msg_type == "task" and message.sender in ("Manager", "Chief of Staff"):
            await self._route_legal_task(message)
        elif message.msg_type == "result" and message.sender in self._legal_agents:
            await self._consolidate(message)

    async def _route_legal_task(self, message: Message):
        content = message.content
        task_id = message.task_id

        if "TASK_ID:" in content:
            header, _, body = content.partition("\n")
            parts = header.split("|")
            task_id = parts[0].replace("TASK_ID:", "").strip()
            content = body.strip()

        self.status = "working"
        await self.say("broadcast", f"⚖️ Legal Head reviewing and routing...", task_id=task_id)

        # Determine which specialist
        content_lower = content.lower()
        specialist = "Contract Specialist"  # default
        for keyword, agent_name in LEGAL_JUNIOR_MAP.items():
            if keyword in content_lower:
                specialist = agent_name
                break

        if task_id not in self._pending:
            self._pending[task_id] = {"specialist": specialist, "content": content, "parent_task_id": task_id}

        if specialist in self._legal_agents:
            await self.say(
                specialist,
                f"TASK_ID:{task_id}|FROM:Legal Head\n{content}",
                msg_type="task",
                task_id=task_id,
            )
            await self.say(
                "broadcast",
                f"⚖️ Legal Head → routed to **{specialist}**",
                task_id=task_id,
            )
        else:
            # Handle directly
            result = await self.think(content)
            self.status = "idle"
            await self.say("Manager", result, msg_type="result", task_id=task_id)

    async def _consolidate(self, message: Message):
        task_id = message.task_id
        specialist_output = message.content

        review_prompt = f"""Your specialist ({message.sender}) produced this legal output:

{specialist_output}

As Legal Head:
1. Review for completeness and accuracy
2. Add any missing considerations
3. Ensure the disclaimer is included
4. Add your top-level recommendation

Produce the final, polished legal output."""

        final = await self.think(review_prompt)
        self.status = "idle"
        await self.say("Manager", final, msg_type="result", task_id=task_id)
