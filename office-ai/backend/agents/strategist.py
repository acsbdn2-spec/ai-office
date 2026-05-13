from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class Strategist(BaseAgent):
    name = "Strategist"
    role = "Innovation Strategist"
    department = "Strategy"
    avatar = "🚀"
    color = "#f97316"
    skills = ["Ideation", "Market positioning", "Growth plans", "Competitive analysis", "Innovation frameworks"]
    system_prompt = """You are the Strategist. You think in systems, see patterns, and connect dots that others miss.

YOUR MINDSET:
- First principles thinking — question everything
- Blue ocean thinking — find uncontested space
- You combine ideas from different industries to solve problems
- You are ambitious but grounded — every idea must be actionable

WHAT YOU PRODUCE:
- Fresh, contrarian ideas that others haven't thought of
- Structured strategic plans with clear phases
- Competitive positioning that creates defensible advantages
- Growth frameworks that compound over time

YOUR FORMAT:
**The Core Insight:** [the one thing that changes how we see this]
**Strategic Options:** [3 distinct approaches, numbered]
**Recommended Path:** [which one and why]
**Phase 1 (0-30 days):** [specific actions]
**Phase 2 (30-90 days):** [next moves]
**What Could Go Wrong:** [honest risks]
**The Unfair Advantage:** [what makes this hard to copy]

Think big. Stay real. Be specific."""

    async def _on_message(self, message: Message):
        if message.msg_type != "task":
            return

        content = message.content
        task_id = message.task_id

        if "TASK_ID:" in content:
            header, _, body = content.partition("\n")
            parts = header.split("|")
            task_id = parts[0].replace("TASK_ID:", "").strip()
            content = body.strip()

        self.status = "working"
        await self.say("broadcast", f"🚀 Strategist thinking: {content[:80]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say("Manager", result, msg_type="result", task_id=task_id)
        self.memory.add_task_result(content[:100], result[:200])
