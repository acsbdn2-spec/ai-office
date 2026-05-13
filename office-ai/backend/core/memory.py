import json
import os
from datetime import datetime


class AgentMemory:
    """Persistent per-agent memory — lessons learned, past outputs, feedback scores."""

    def __init__(self, agent_name: str, storage_dir: str = "memory_store"):
        self.agent_name = agent_name
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self._path = os.path.join(storage_dir, f"{agent_name}.json")
        self._data = self._load()

    def _load(self) -> dict:
        if os.path.exists(self._path):
            with open(self._path, "r") as f:
                return json.load(f)
        return {
            "lessons_learned": [],
            "successful_patterns": [],
            "feedback_log": [],
            "task_history": [],
            "avg_score": 0,
            "total_tasks": 0,
        }

    def _save(self):
        with open(self._path, "w") as f:
            json.dump(self._data, f, indent=2)

    def add_lesson(self, lesson: str):
        self._data["lessons_learned"].append({
            "lesson": lesson,
            "date": datetime.now().isoformat(),
        })
        if len(self._data["lessons_learned"]) > 30:
            self._data["lessons_learned"] = self._data["lessons_learned"][-30:]
        self._save()

    def add_feedback(self, task_summary: str, score: int, comment: str):
        self._data["feedback_log"].append({
            "task": task_summary,
            "score": score,
            "comment": comment,
            "date": datetime.now().isoformat(),
        })
        total = self._data["total_tasks"] + 1
        prev_avg = self._data["avg_score"]
        self._data["avg_score"] = round((prev_avg * self._data["total_tasks"] + score) / total, 2)
        self._data["total_tasks"] = total
        self._save()

    def add_task_result(self, task: str, result_summary: str):
        self._data["task_history"].append({
            "task": task,
            "result": result_summary,
            "date": datetime.now().isoformat(),
        })
        if len(self._data["task_history"]) > 50:
            self._data["task_history"] = self._data["task_history"][-50:]
        self._save()

    def get_context_prompt(self) -> str:
        """Build a concise memory block to inject into agent prompts."""
        lines = []
        if self._data["lessons_learned"]:
            recent = self._data["lessons_learned"][-5:]
            lines.append("LESSONS I'VE LEARNED FROM PAST WORK:")
            for l in recent:
                lines.append(f"  - {l['lesson']}")
        if self._data["avg_score"] > 0:
            lines.append(f"MY AVERAGE QUALITY SCORE: {self._data['avg_score']}/10 across {self._data['total_tasks']} tasks.")
        if self._data["feedback_log"]:
            last = self._data["feedback_log"][-1]
            lines.append(f"LAST FEEDBACK: Score {last['score']}/10 — {last['comment']}")
        return "\n".join(lines) if lines else ""
