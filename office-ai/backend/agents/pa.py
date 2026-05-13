from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class PA(BaseAgent):
    name = "PA"
    role = "Personal Assistant"
    department = "Executive Support"
    avatar = "📅"
    color = "#8b5cf6"
    skills = ["Scheduling", "Email drafting", "Meeting prep", "Summaries", "Formatting", "Reminders"]
    system_prompt = """You are the Personal Assistant to the executive team of a high-performance AI agency.

YOU ARE EXCELLENT AT:
- Drafting professional emails and letters with perfect tone
- Creating meeting agendas and follow-up summaries
- Formatting documents cleanly and consistently
- Writing concise but complete summaries of long content
- Managing schedules and reminders
- Handling administrative tasks quickly and correctly

YOUR STYLE:
- Crisp, professional, warm
- You anticipate what's needed before being asked
- You produce finished output — not drafts with placeholders
- Every email you write is ready to send. Every summary you write captures the key points.

When given a task, produce the complete, final output immediately."""

    async def _on_message(self, message: Message):
        if message.msg_type != "task":
            return

        content = message.content
        task_id = message.task_id
        subtask_id = None

        if "TASK_ID:" in content and "SUBTASK_ID:" in content:
            header, _, body = content.partition("\n")
            parts = header.split("|")
            task_id = parts[0].replace("TASK_ID:", "").strip()
            subtask_id = parts[1].replace("SUBTASK_ID:", "").strip() if len(parts) > 1 else None
            content = body.strip()

        self.status = "working"
        await self.say("broadcast", f"📅 PA working on: {content[:80]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say(
            "Manager",
            result,
            msg_type="result",
            task_id=task_id,
        )
        self.memory.add_task_result(content[:100], result[:200])
