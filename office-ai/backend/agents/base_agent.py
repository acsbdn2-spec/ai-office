import asyncio
import os
from groq import AsyncGroq
from core.memory import AgentMemory
from core.message_bus import Message, MessageBus


class BaseAgent:
    name: str = "Agent"
    role: str = "Generic Agent"
    department: str = "General"
    avatar: str = "🤖"
    color: str = "#6366f1"
    skills: list[str] = []
    system_prompt: str = ""

    def __init__(self, bus: MessageBus):
        self.bus = bus
        self.memory = AgentMemory(self.name)
        self.status = "idle"  # idle | thinking | working
        self._client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self._model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        bus.subscribe(self.name, self._on_message)

    # ── LLM call ─────────────────────────────────────────────────────────────

    async def think(self, user_message: str, extra_context: str = "") -> str:
        memory_ctx = self.memory.get_context_prompt()
        system = self._build_system(memory_ctx, extra_context)
        self.status = "thinking"
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.7,
                max_tokens=2048,
            )
            result = response.choices[0].message.content
        finally:
            self.status = "idle"
        return result

    def _build_system(self, memory_ctx: str, extra_context: str) -> str:
        parts = [self.system_prompt]
        if memory_ctx:
            parts.append(f"\n\n{memory_ctx}")
        if extra_context:
            parts.append(f"\n\nCONTEXT FOR THIS TASK:\n{extra_context}")
        parts.append(
            "\n\nIMPORTANT: Give real, usable outputs — actual code, actual documents, "
            "actual scripts. Not descriptions of what you would do. DO the work."
        )
        return "\n".join(parts)

    # ── Messaging ─────────────────────────────────────────────────────────────

    async def say(self, recipient: str, content: str, msg_type: str = "chat", task_id: str = None):
        msg = Message(
            sender=self.name,
            recipient=recipient,
            content=content,
            msg_type=msg_type,
            task_id=task_id,
        )
        await self.bus.publish(msg)

    async def broadcast(self, content: str, msg_type: str = "chat", task_id: str = None):
        await self.say("broadcast", content, msg_type, task_id)

    async def _on_message(self, message: Message):
        """Override in subclasses to handle incoming messages."""
        pass

    # ── Improvement loop ──────────────────────────────────────────────────────

    async def reflect(self, task_summary: str, my_output: str, feedback: str, score: int):
        """Called after a task completes — agent learns from feedback."""
        self.memory.add_feedback(task_summary, score, feedback)
        lesson_prompt = (
            f"Task I did: {task_summary}\n"
            f"My output: {my_output[:300]}\n"
            f"Feedback received: {feedback}\n"
            f"Score: {score}/10\n\n"
            "In ONE concise sentence, what is the single most important thing I should remember "
            "to do better next time? Start with 'Next time I should...'"
        )
        lesson = await self.think(lesson_prompt)
        self.memory.add_lesson(lesson)
        return lesson

    def agent_info(self) -> dict:
        return {
            "name": self.name,
            "role": self.role,
            "department": self.department,
            "avatar": self.avatar,
            "color": self.color,
            "skills": self.skills,
            "status": self.status,
            "avg_score": self.memory._data.get("avg_score", 0),
            "total_tasks": self.memory._data.get("total_tasks", 0),
        }
