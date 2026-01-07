from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Optional


@dataclass(frozen=True)
class HistoricalContext:
    avgTemp: Optional[float]
    trend: str
    alerts: int


def _parse_ts(value: Any) -> Optional[datetime]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            # Accept both "Z" and offset formats
            if value.endswith("Z"):
                value = value[:-1] + "+00:00"
            return datetime.fromisoformat(value)
        except ValueError:
            return None
    return None


def _coerce_float(x: Any) -> Optional[float]:
    try:
        if x is None:
            return None
        return float(x)
    except Exception:
        return None


def get_24h_context(current_ts: datetime) -> HistoricalContext:
    """
    Lightweight historical context builder.

    If `mock_data/sensor_readings.json` exists, derive:
    - avgTemp: average temperature across last 24h
    - trend: stable/rising/falling
    - alerts: count of readings outside mild thresholds
    """
    base_dir = os.path.dirname(os.path.dirname(__file__))
    path = os.path.join(base_dir, "mock_data", "sensor_readings.json")

    if current_ts.tzinfo is None:
        current_ts = current_ts.replace(tzinfo=timezone.utc)

    start = current_ts - timedelta(hours=24)

    if not os.path.exists(path):
        return HistoricalContext(avgTemp=None, trend="unknown", alerts=0)

    try:
        with open(path, "r") as f:
            rows = json.load(f)
    except Exception:
        return HistoricalContext(avgTemp=None, trend="unknown", alerts=0)

    points: list[tuple[datetime, float]] = []
    alerts = 0

    for r in rows if isinstance(rows, list) else []:
        ts = _parse_ts(r.get("timestamp") if isinstance(r, dict) else None)
        temp = _coerce_float(r.get("temperature") if isinstance(r, dict) else None)
        if ts is None or temp is None:
            continue
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        if ts < start or ts > current_ts:
            continue

        points.append((ts, temp))

        if temp >= 35 or temp <= 15:
            alerts += 1

    if not points:
        return HistoricalContext(avgTemp=None, trend="unknown", alerts=alerts)

    points.sort(key=lambda x: x[0])
    temps = [t for _, t in points]
    avg = sum(temps) / len(temps)

    # Trend by comparing first vs last
    delta = temps[-1] - temps[0]
    if abs(delta) < 1.0:
        trend = "stable"
    elif delta > 0:
        trend = "rising"
    else:
        trend = "falling"

    return HistoricalContext(avgTemp=round(avg, 2), trend=trend, alerts=alerts)


