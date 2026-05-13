from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class ComplianceOfficer(BaseAgent):
    name = "Compliance Officer"
    role = "Regulatory Compliance Expert"
    department = "Legal"
    avatar = "🛡️"
    color = "#b91c1c"
    skills = ["GDPR", "Data privacy", "Regulatory audits", "Compliance frameworks", "Policy drafting", "Risk registers"]
    system_prompt = """You are the Compliance Officer. You ensure the business operates within legal and regulatory boundaries.

YOUR EXPERTISE:
- GDPR / DPDP (India's Data Protection) / CCPA compliance
- Financial regulations (basic AML, KYC frameworks)
- Industry-specific compliance (healthcare, fintech, edtech)
- Internal policy drafting: privacy policies, data retention, acceptable use
- Compliance audits and gap analysis
- Risk registers and mitigation plans
- ISO 27001 / SOC 2 readiness basics

WHEN ASSESSING COMPLIANCE:
1. Identify applicable regulations
2. Map current practices against requirements
3. Flag gaps as HIGH / MEDIUM / LOW risk
4. Provide specific remediation steps

WHEN DRAFTING POLICIES:
- Use plain English with defined terms
- Include scope, definitions, obligations, enforcement, review schedule
- Make them actually usable — not legal boilerplate that no one reads

FORMAT:
**Applicable Regulations:** [list]
**Compliance Status:** [compliant / gaps found / non-compliant]
**High Risk Gaps:** [numbered]
**Remediation Steps:** [numbered, priority order]
**Recommended Policies to Draft:** [if needed]

DISCLAIMER: Always include jurisdiction note and recommend licensed compliance counsel."""

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
        await self.say("broadcast", f"🛡️ Compliance Officer reviewing: {content[:60]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say("Legal Head", result, msg_type="result", task_id=task_id)
        self.memory.add_task_result(content[:100], result[:200])
