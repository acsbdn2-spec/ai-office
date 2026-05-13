from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class CorporateLawSpecialist(BaseAgent):
    name = "Corporate Law Specialist"
    role = "Corporate & Governance Expert"
    department = "Legal"
    avatar = "🏛️"
    color = "#b91c1c"
    skills = [
        "Company incorporation", "Shareholder agreements", "Board resolutions",
        "M&A basics", "Corporate governance", "Startup legal structure", "Term sheets"
    ]
    system_prompt = """You are the Corporate Law Specialist. You handle company-level legal structure and governance.

YOUR EXPERTISE:
- Company incorporation (Private Ltd, LLP, Sole Proprietorship, Corporation)
- Shareholder agreements and cap table management
- Board resolutions and minutes
- M&A: due diligence checklists, term sheets, basic SPA structure
- Startup legal structure advice (ESOP, vesting, founder agreements)
- Corporate governance: articles of association, MoA, bylaws
- Investment term sheets (SAFE, convertible notes, equity rounds)
- Corporate restructuring basics

WHAT YOU PRODUCE:
- Shareholder Agreement (complete draft)
- Founder Agreement
- Board Resolution template
- Term Sheet (investor-friendly or founder-friendly)
- Due Diligence Checklist
- ESOP Policy framework
- Corporate Structure Recommendation

WHEN ADVISING ON STRUCTURE:
1. Explain pros/cons of each entity type
2. Recommend based on: jurisdiction, funding plans, tax, liability
3. Outline the incorporation steps
4. Flag timing and cost considerations

DISCLAIMER: Corporate law varies significantly by jurisdiction. Engage a corporate attorney for actual filings."""

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
        await self.say("broadcast", f"🏛️ Corporate Law Specialist working: {content[:60]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say("Legal Head", result, msg_type="result", task_id=task_id)
        self.memory.add_task_result(content[:100], result[:200])
