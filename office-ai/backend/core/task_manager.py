import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class SubTask:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    assigned_to: str = ""
    description: str = ""
    status: str = "pending"  # pending | in_progress | done | reviewed
    result: str = ""
    score: int = 0
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None


@dataclass
class Task:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    original_request: str = ""
    submitted_by: str = "User"
    status: str = "received"  # received | planning | in_progress | reviewing | done
    subtasks: list = field(default_factory=list)
    final_output: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None

    def add_subtask(self, assigned_to: str, description: str) -> SubTask:
        st = SubTask(assigned_to=assigned_to, description=description)
        self.subtasks.append(st)
        return st

    def get_subtask(self, subtask_id: str) -> Optional[SubTask]:
        for st in self.subtasks:
            if st.id == subtask_id:
                return st
        return None

    def all_done(self) -> bool:
        return all(st.status in ("done", "reviewed") for st in self.subtasks)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "original_request": self.original_request,
            "status": self.status,
            "subtasks": [
                {
                    "id": st.id,
                    "assigned_to": st.assigned_to,
                    "description": st.description,
                    "status": st.status,
                    "result": st.result[:200] + "..." if len(st.result) > 200 else st.result,
                    "score": st.score,
                }
                for st in self.subtasks
            ],
            "final_output": self.final_output,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
        }


class TaskManager:
    def __init__(self):
        self._tasks: dict[str, Task] = {}

    def create_task(self, request: str) -> Task:
        t = Task(original_request=request)
        self._tasks[t.id] = t
        return t

    def get_task(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def all_tasks(self) -> list[Task]:
        return list(self._tasks.values())
