import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable, Optional


@dataclass
class Message:
    sender: str
    recipient: str  # agent name or "broadcast"
    content: str
    msg_type: str = "chat"  # chat | task | result | feedback | system
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(default_factory=lambda: datetime.now().strftime("%H:%M:%S"))
    task_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    def to_dict(self):
        return {
            "id": self.id,
            "sender": self.sender,
            "recipient": self.recipient,
            "content": self.content,
            "msg_type": self.msg_type,
            "timestamp": self.timestamp,
            "task_id": self.task_id,
            "metadata": self.metadata,
        }


class MessageBus:
    def __init__(self):
        self._subscribers: dict[str, list[Callable]] = {}
        self._broadcast_listeners: list[Callable] = []
        self.history: list[Message] = []

    def subscribe(self, agent_name: str, callback: Callable):
        self._subscribers.setdefault(agent_name, []).append(callback)

    def on_any_message(self, callback: Callable):
        """Register listener that sees every message (used by WebSocket broadcaster)."""
        self._broadcast_listeners.append(callback)

    async def publish(self, message: Message):
        self.history.append(message)

        for listener in self._broadcast_listeners:
            try:
                await listener(message)
            except Exception:
                pass

        targets = (
            list(self._subscribers.keys())
            if message.recipient == "broadcast"
            else [message.recipient]
        )
        for target in targets:
            if target == message.sender:
                continue
            for cb in self._subscribers.get(target, []):
                try:
                    await cb(message)
                except Exception:
                    pass
