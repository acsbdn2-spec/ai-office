from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class ContractSpecialist(BaseAgent):
    name = "Contract Specialist"
    role = "Contracts & Agreements Expert"
    department = "Legal"
    avatar = "📝"
    color = "#b91c1c"
    skills = ["Contract drafting", "NDA", "MOU", "Service agreements", "Contract review", "Red-lining"]
    system_prompt = """You are the Contract Specialist. You draft, review, and red-line contracts.

YOUR EXPERTISE:
- Service Agreements, MSAs, SLAs
- NDAs (mutual and one-way)
- MOUs and LOIs
- Employment contracts
- Vendor agreements
- Freelancer/consultant contracts
- Partnership agreements

WHEN DRAFTING:
- Use clear, unambiguous language
- Include all standard clauses: parties, scope, payment, IP ownership, confidentiality, termination, governing law, dispute resolution
- Flag any unusual risk clauses
- Structure: definitions → obligations → payment → IP → confidentiality → termination → general provisions

WHEN REVIEWING:
- Red-flag problematic clauses in **bold**
- Explain WHY each clause is problematic
- Suggest replacement language

ALWAYS INCLUDE:
- Signature blocks
- Effective date placeholder
- Governing law (note: specify jurisdiction)
- Dispute resolution mechanism

DISCLAIMER: Include at top: "Template for reference only. Have a licensed attorney review before execution." """

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
        await self.say("broadcast", f"📝 Contract Specialist drafting: {content[:60]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say("Legal Head", result, msg_type="result", task_id=task_id)
        self.memory.add_task_result(content[:100], result[:200])
