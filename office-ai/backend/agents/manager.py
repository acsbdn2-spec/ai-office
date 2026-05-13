import asyncio
from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus
from core.task_manager import TaskManager


AGENT_KEYWORDS = {
    "Master Coder": ["code", "script", "program", "bug", "function", "api", "automat", "develop"],
    "Legal Head": ["legal", "contract", "compliance", "law", "regulation", "ip", "patent", "employ"],
    "Business Specialist": ["business", "market", "strategy", "revenue", "client", "proposal", "pitch"],
    "Document Agent": ["document", "draft", "report", "format", "convert", "proofread", "letter", "email"],
    "Design Agent": ["poster", "design", "visual", "brand", "logo", "presentation", "graphic", "flyer"],
    "Telecalling Agent": ["call", "script", "outreach", "telecall", "prospect", "follow-up", "cold"],
    "Data Agent": ["data", "database", "spreadsheet", "client list", "crm", "entry", "report"],
    "Advisor": ["advise", "recommend", "risk", "review", "opinion", "evaluate"],
    "Strategist": ["idea", "innovation", "plan", "grow", "strategy", "new", "improve", "future"],
    "PA": ["schedule", "reminder", "meeting", "quick", "summary", "format"],
}


class Manager(BaseAgent):
    name = "Manager"
    role = "Execution Overseer"
    department = "Management"
    avatar = "📊"
    color = "#3b82f6"
    skills = ["Task assignment", "Quality control", "Team coordination", "Progress tracking"]
    system_prompt = """You are the Operations Manager. You sit between the Chief of Staff and the specialist team.

YOUR JOB:
- Read the Chief's plan and break it into concrete assignments for each agent
- Track every subtask — know who has what and what the status is
- After receiving results, review them for quality and give a score (1-10) with brief feedback
- If quality is below 7, ask the agent to redo it with specific improvements
- Report progress back to the Chief of Staff
- Keep the team motivated and on track

TONE: Professional, direct, fair. You push for quality without being harsh.
You know each agent's strengths and assign accordingly.
You give clear, specific feedback: not "this is bad" but "this needs X because Y"."""

    def __init__(self, bus: MessageBus, task_manager: TaskManager, agents: dict):
        super().__init__(bus)
        self._task_manager = task_manager
        self._agents = agents  # name -> agent instance
        self._active_tasks: dict[str, dict] = {}  # task_id -> tracking state

    async def _on_message(self, message: Message):
        if message.msg_type == "task" and message.sender == "Chief of Staff":
            await self._handle_chief_assignment(message)
        elif message.msg_type == "result":
            await self._handle_agent_result(message)

    async def _handle_chief_assignment(self, message: Message):
        content = message.content
        task_id = None
        if "TASK_ID:" in content:
            lines = content.split("\n")
            task_id = lines[0].replace("TASK_ID:", "").strip()

        task = self._task_manager.get_task(task_id) if task_id else None
        if not task:
            return

        self._active_tasks[task_id] = {"results": {}, "pending": set()}

        assign_prompt = f"""Chief of Staff plan:
{content}

Now produce a JSON-style list of assignments like:
AGENT: [name]
TASK: [exactly what they must produce]
---
AGENT: [name]
TASK: [exactly what they must produce]

Use only agents from this list: {list(AGENT_KEYWORDS.keys())}
Be specific about what each agent must OUTPUT (not just do)."""

        assignments_text = await self.think(assign_prompt)

        await self.say(
            "broadcast",
            f"📋 **Manager assigning work:**\n{assignments_text}",
            msg_type="system",
            task_id=task_id,
        )

        # Parse and dispatch assignments
        blocks = assignments_text.split("---")
        for block in blocks:
            agent_name = None
            agent_task = None
            for line in block.strip().split("\n"):
                if line.startswith("AGENT:"):
                    agent_name = line.replace("AGENT:", "").strip()
                elif line.startswith("TASK:"):
                    agent_task = line.replace("TASK:", "").strip()
            if agent_name and agent_task and agent_name in self._agents:
                st = task.add_subtask(agent_name, agent_task)
                self._active_tasks[task_id]["pending"].add(agent_name)
                await self.say(
                    agent_name,
                    f"TASK_ID:{task_id}|SUBTASK_ID:{st.id}\n{agent_task}\n\nOriginal context: {task.original_request}",
                    msg_type="task",
                    task_id=task_id,
                )

    async def _handle_agent_result(self, message: Message):
        task_id = message.task_id
        if not task_id or task_id not in self._active_tasks:
            return

        agent_name = message.sender
        result = message.content

        # QA the result
        qa_prompt = f"""Agent {agent_name} produced this output:

{result[:1500]}

Score this output from 1-10 on: completeness, quality, usefulness.
Then give ONE specific improvement if score < 8.

Format:
SCORE: [number]
VERDICT: [one sentence]
IMPROVEMENT: [specific actionable note, or "None needed"]"""

        qa = await self.think(qa_prompt)

        score = 7
        verdict = ""
        improvement = ""
        for line in qa.split("\n"):
            if line.startswith("SCORE:"):
                try:
                    score = int(line.replace("SCORE:", "").strip())
                except ValueError:
                    pass
            elif line.startswith("VERDICT:"):
                verdict = line.replace("VERDICT:", "").strip()
            elif line.startswith("IMPROVEMENT:"):
                improvement = line.replace("IMPROVEMENT:", "").strip()

        # Store result
        task = self._task_manager.get_task(task_id)
        if task:
            for st in task.subtasks:
                if st.assigned_to == agent_name and st.status == "in_progress":
                    st.result = result
                    st.score = score
                    st.status = "reviewed"
                    break

        self._active_tasks[task_id]["results"][agent_name] = result
        self._active_tasks[task_id]["pending"].discard(agent_name)

        await self.broadcast(
            f"✅ **QA Review — {agent_name}**\nScore: {score}/10 | {verdict}",
            msg_type="feedback",
            task_id=task_id,
        )

        # Trigger reflection in the agent
        if agent_name in self._agents:
            asyncio.create_task(
                self._agents[agent_name].reflect(
                    task_summary=task.original_request if task else "",
                    my_output=result,
                    feedback=f"{verdict}. {improvement}",
                    score=score,
                )
            )

        # Check if all subtasks done
        if not self._active_tasks[task_id]["pending"]:
            await self._finalize(task_id)

    async def _finalize(self, task_id: str):
        task = self._task_manager.get_task(task_id)
        if not task:
            return
        await self.say(
            "Chief of Staff",
            f"TASK_ID:{task_id} All subtasks complete. Ready for final compilation.",
            msg_type="system",
            task_id=task_id,
        )
        chief = self._agents.get("Chief of Staff")
        if chief:
            await chief.compile_final_output(task)
