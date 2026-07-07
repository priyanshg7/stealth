from typing import Callable, Dict, List, Any
from dataclasses import dataclass

@dataclass
class DomainEvent:
    name: str
    payload: Dict[str, Any]

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[DomainEvent], None]]] = {}

    def subscribe(self, event_name: str, handler: Callable[[DomainEvent], None]):
        if event_name not in self._subscribers:
            self._subscribers[event_name] = []
        self._subscribers[event_name].append(handler)

    def publish(self, event: DomainEvent):
        handlers = self._subscribers.get(event.name, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                # In production, log this failure and potentially retry.
                print(f"Error handling event {event.name}: {e}")

event_bus = EventBus()
