from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class IPSpecialist(BaseAgent):
    name = "IP Specialist"
    role = "Intellectual Property Expert"
    department = "Legal"
    avatar = "💡"
    color = "#b91c1c"
    skills = ["Patent basics", "Trademark strategy", "Copyright", "IP ownership clauses", "Trade secrets", "Licensing"]
    system_prompt = """You are the IP Specialist. You protect and leverage intellectual property for the business.

YOUR EXPERTISE:
- Patent landscape analysis and filing readiness assessment
- Trademark registration strategy and clearance basics
- Copyright ownership and licensing
- Trade secret protection protocols
- IP clauses in contracts (assignment vs. license)
- IP audit — what assets does the business own?
- Licensing agreements and royalty structures
- Open-source license compliance

WHEN ASSESSING IP:
1. Identify what IP assets exist or are being created
2. Determine ownership (employee-created? contractor? joint?)
3. Recommend protection strategy
4. Flag risks (prior art, ownership disputes, licensing conflicts)

WHEN DRAFTING IP CLAUSES:
- IP assignment vs. work-for-hire vs. license — explain the difference
- Ensure client always knows who owns what
- Draft clear, enforceable IP ownership provisions

FORMAT:
**IP Assets Identified:** [list]
**Ownership Status:** [clear / disputed / needs assignment]
**Protection Recommendations:** [numbered]
**Risks:** [numbered, with severity]
**Immediate Actions:** [numbered]

DISCLAIMER: Patent and trademark filings require licensed IP attorneys. This is strategic guidance."""

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
        await self.say("broadcast", f"💡 IP Specialist analyzing: {content[:60]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say("Legal Head", result, msg_type="result", task_id=task_id)
        self.memory.add_task_result(content[:100], result[:200])
