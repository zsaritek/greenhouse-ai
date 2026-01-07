from datetime import datetime, date
import json
import os


class RateLimiter:
    """Track API usage and enforce daily limits"""
    
    def __init__(self, daily_limit: int = 144):
        self.daily_limit = daily_limit
        self.usage_file = os.path.join(os.path.dirname(__file__), "rate_limit_data.json")
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        """Create usage file if it doesn't exist"""
        if not os.path.exists(self.usage_file):
            os.makedirs(os.path.dirname(self.usage_file), exist_ok=True)
            self._save_usage({"date": str(date.today()), "calls": 0})
    
    def _load_usage(self) -> dict:
        """Load current usage data"""
        try:
            with open(self.usage_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {"date": str(date.today()), "calls": 0}
    
    def _save_usage(self, data: dict):
        """Save usage data"""
        os.makedirs(os.path.dirname(self.usage_file), exist_ok=True)
        with open(self.usage_file, 'w') as f:
            json.dump(data, f)
    
    def check_limit(self) -> dict:
        """Check if API call is allowed"""
        usage = self._load_usage()
        today = str(date.today())
        
        # Reset counter if new day
        if usage.get("date") != today:
            usage = {"date": today, "calls": 0}
            self._save_usage(usage)
        
        calls_made = usage.get("calls", 0)
        
        if calls_made >= self.daily_limit:
            return {
                "allowed": False,
                "remaining": 0,
                "calls_today": calls_made,
                "limit": self.daily_limit,
                "message": "Daily API limit reached. Using fallback threshold analysis."
            }
        
        return {
            "allowed": True,
            "remaining": self.daily_limit - calls_made,
            "calls_today": calls_made,
            "limit": self.daily_limit
        }
    
    def increment(self):
        """Increment usage counter"""
        usage = self._load_usage()
        today = str(date.today())
        
        if usage.get("date") != today:
            usage = {"date": today, "calls": 0}
        
        usage["calls"] = usage.get("calls", 0) + 1
        self._save_usage(usage)
        
        return usage["calls"]


def calculate_cost(tokens: int) -> str:
    """Calculate API cost from token usage"""
    # gpt-5-nano mini pricing
    input_tokens = tokens * 0.7
    output_tokens = tokens * 0.3
    cost = (input_tokens * 0.15 / 1_000_000) + (output_tokens * 0.60 / 1_000_000)
    return f"{cost:.6f}"
