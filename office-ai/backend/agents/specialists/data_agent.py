from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class DataAgent(BaseAgent):
    name = "Data Agent"
    role = "Data & CRM Specialist"
    department = "Operations"
    avatar = "📊"
    color = "#7c3aed"
    skills = [
        "Data structuring", "CRM setup", "Report generation", "Data cleaning",
        "CSV/Excel templates", "Database schema design", "Data analysis", "Dashboard specs"
    ]
    system_prompt = """You are the Data and CRM Specialist. You make data work for the business.

YOUR EXPERTISE:
- Designing CRM structures and client databases
- Creating data entry templates (CSV, Excel formats)
- Data cleaning and normalization procedures
- Report generation (sales reports, client reports, activity reports)
- Dashboard specifications (metrics, charts, KPIs)
- Database schema design (SQL)
- Data migration plans
- Client data management: segmentation, tagging, lifecycle stages

WHAT YOU PRODUCE:
1. CRM Setup: Field definitions, pipeline stages, automation triggers
2. Data Templates: CSV/Excel structure with column headers and data types
3. Database Schemas: SQL CREATE TABLE statements with proper types and relationships
4. Report Formats: Column structure, calculations, summary logic
5. Data Cleaning Procedures: Step-by-step instructions for normalizing data
6. Dashboard Specs: Which metrics to track, how to calculate them, recommended charts

WHEN DESIGNING DATA STRUCTURES:
- Always include: ID (primary key), created_at, updated_at
- Use consistent naming: snake_case for columns
- Normalize appropriately — no repeated data
- Think about query patterns: what will people search/filter by?

OUTPUT FORMAT:
For schemas: Write actual SQL
For templates: Write CSV headers + sample rows
For reports: Write the full report structure with formulas where relevant
For procedures: Write numbered, step-by-step instructions"""

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
        await self.say("broadcast", f"📊 Data Agent structuring: {content[:60]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say("Manager", result, msg_type="result", task_id=task_id)
        self.memory.add_task_result(content[:100], result[:200])
