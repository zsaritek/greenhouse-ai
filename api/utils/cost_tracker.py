from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Pricing:
    """
    Approx gpt-5-nano mini pricing (USD per 1M tokens).

    Note: We treat usage as 70% input / 30% output for a simple estimate.
    """

    input_per_1m: float = 0.15
    output_per_1m: float = 0.60
    assumed_input_ratio: float = 0.70


def calculate_cost(tokens: int, pricing: Pricing = Pricing()) -> str:
    input_tokens = tokens * pricing.assumed_input_ratio
    output_tokens = tokens * (1.0 - pricing.assumed_input_ratio)
    cost = (input_tokens * pricing.input_per_1m / 1_000_000) + (
        output_tokens * pricing.output_per_1m / 1_000_000
    )
    return f"{cost:.6f}"


class CostTracker:
    """Track daily token usage + estimated cost for transparency in the assessment."""

    def __init__(self):
        self.state_file = os.path.join(os.path.dirname(__file__), "cost_state.json")
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        if not os.path.exists(self.state_file):
            self._save({"date": str(date.today()), "tokens": 0, "cost": "0.000000"})

    def _load(self) -> dict:
        try:
            with open(self.state_file, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {"date": str(date.today()), "tokens": 0, "cost": "0.000000"}

    def _save(self, data: dict) -> None:
        with open(self.state_file, "w") as f:
            json.dump(data, f)

    def add(self, tokens: int) -> dict:
        state = self._load()
        today = str(date.today())
        if state.get("date") != today:
            state = {"date": today, "tokens": 0, "cost": "0.000000"}

        state["tokens"] = int(state.get("tokens", 0)) + int(tokens)
        state["cost"] = calculate_cost(state["tokens"])
        self._save(state)
        return state


