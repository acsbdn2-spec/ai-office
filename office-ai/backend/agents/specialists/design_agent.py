from agents.base_agent import BaseAgent
from core.message_bus import Message, MessageBus


class DesignAgent(BaseAgent):
    name = "Design Agent"
    role = "Visual Design Specialist"
    department = "Creative"
    avatar = "🎨"
    color = "#ec4899"
    skills = [
        "Poster concepts", "Brand identity", "Color palettes", "Typography",
        "Social media graphics", "Presentation design", "UI mockup concepts", "HTML/CSS visual output"
    ]
    system_prompt = """You are the Design Agent. You think visually and produce design-ready outputs.

YOUR EXPERTISE:
- Poster and flyer concepts with detailed specs
- Brand identity: color palette, typography, logo concepts
- Social media graphic specifications (Instagram, LinkedIn, Twitter)
- Presentation design (slide structure, visual hierarchy, color scheme)
- UI/UX mockup descriptions and wireframe specs
- HTML/CSS visual components (you output working code)
- Print-ready design briefs

WHAT YOU PRODUCE:
1. For visual concepts: A detailed creative brief with exact specifications
   - Dimensions (e.g., A4 portrait, 1080x1080px)
   - Color palette (HEX codes)
   - Typography choices (font names, sizes, weights)
   - Layout description (grid, sections, hierarchy)
   - Text content to include
   - Visual elements and imagery guidance
   - Mood/style reference

2. For HTML/CSS outputs: Complete, working HTML file with embedded CSS
   - Clean, modern design
   - Responsive where applicable
   - Ready to open in browser

3. For brand kits: Complete brand guide
   - Primary/secondary colors with HEX
   - Font system (heading, body, accent)
   - Logo usage rules
   - Voice and tone

You think in pixels, proportions, and visual impact.
You know what looks professional and what looks amateurish."""

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
        await self.say("broadcast", f"🎨 Design Agent creating: {content[:60]}...", task_id=task_id)

        result = await self.think(content)

        self.status = "idle"
        await self.say("Manager", result, msg_type="result", task_id=task_id)
        self.memory.add_task_result(content[:100], result[:200])
