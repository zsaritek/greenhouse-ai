from __future__ import annotations

import base64
import json
import logging
import os
import re
from typing import Optional

from openai import AsyncOpenAI

from utils.cost_tracker import calculate_cost

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service for interacting with OpenAI (vision-capable) models."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("Missing OPENAI_API_KEY. Set it in api/.env or environment.")

        self.client = AsyncOpenAI(api_key=api_key)
        self.model = os.getenv("OPENAI_MODEL", "gpt-5-nano")
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
        self.max_output_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "300"))

    @staticmethod
    def _encode_image_bytes(image_bytes: bytes) -> str:
        return base64.b64encode(image_bytes).decode("utf-8")

    @staticmethod
    def _extract_first_json_object(text: str) -> str:
        """
        Best-effort JSON extraction if the model returns extra text.
        Keeps the service resilient without silently accepting malformed outputs.
        """
        text = text.strip()
        if text.startswith("{") and text.endswith("}"):
            return text

        # crude but effective for single JSON object responses
        m = re.search(r"\{[\s\S]*\}", text)
        if not m:
            raise json.JSONDecodeError("No JSON object found in output", text, 0)
        return m.group(0)
    
    async def analyze_greenhouse(
        self,
        sensor_data: dict,
        historical: dict,
        image_bytes: Optional[bytes] = None,
        image_mime_type: Optional[str] = None,
    ) -> dict:
        """
        Analyze greenhouse conditions using OpenAI model (supports vision).
        
        Args:
            sensor_data: Current sensor readings
            historical: 24h historical context
            image_bytes: Optional raw bytes of plant image
            image_mime_type: Optional mime type (e.g. image/jpeg)
            
        Returns:
            dict: Analysis result with status, confidence, reasoning, etc.
        """
        
        # Build user message content
        user_content = []
        
        # Text content
        text_content = f"""CURRENT READING:
Time: {sensor_data.get('timestamp', 'Unknown')}
Temperature: {sensor_data.get('temperature', 'N/A')}°C
Humidity: {sensor_data.get('humidity', 'N/A')}%
CO₂: {sensor_data.get('co2', 'N/A')}ppm
Soil Moisture: {sensor_data.get('soil_moisture', sensor_data.get('soilMoisture', 'N/A'))}%

CONTEXT (past 24 hours):
Average temp: {historical.get('avgTemp', 'N/A')}°C
Trend: {historical.get('trend', 'N/A')}
Previous alerts: {historical.get('alerts', 0)}

{'VISUAL DATA: Plant image attached for visual inspection.' if image_bytes else 'VISUAL DATA: No image available - sensor-only analysis.'}

Analyze this reading for plant stress indicators.{' Cross-reference sensor data with visual assessment.' if image_bytes else ''}"""
        
        user_content.append({
            "type": "text",
            "text": text_content
        })
        
        # Add image if provided
        if image_bytes:
            base64_image = self._encode_image_bytes(image_bytes)
            mime = image_mime_type or "image/jpeg"
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime};base64,{base64_image}",
                    "detail": "low"  # "low" for faster/cheaper, "high" for detailed
                }
            })
        
        # System prompt
        system_prompt = """You are a greenhouse monitoring system analyzing sensor data and visual inspection for cherry tomato plants.

CRITICAL INSTRUCTIONS:
- If any sensor reading is missing or clearly invalid, return status "uncertain"
- If image is provided but blurry/dark/obstructed, return status "uncertain" and mention image quality issue
- If sensor data and visual assessment CONFLICT, return status "uncertain" and explain the conflict
- Consider time of day context (night heat is more concerning)
- Consider rate of change (sudden vs gradual)
- If multiple factors conflict, return status "uncertain"
- Always provide brief reasoning (max 2 sentences)
- Keep visual_assessment to maximum 25 words

Respond ONLY with valid JSON matching this schema:
{
  "status": "normal" | "potential_anomaly" | "uncertain",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation (max 2 sentences)",
  "primary_concern": "temperature" | "humidity" | "co2" | "soil_moisture" | "visual" | null,
  "visual_assessment": "max 25 words describing what you observe in the image (or null if no image)" | null,
  "signals_agree": true | false | null,
  "recommended_action": "what operator should check" | null
}"""
        
        try:
            logger.info(
                "openai_request_start",
                extra={"model": self.model, "hasImage": bool(image_bytes)},
            )
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                temperature=self.temperature,
                max_tokens=self.max_output_tokens,
            )

            # Debug: Log the raw response
            logger.info(f"Raw response: {response}")
            
            # Extract text from response - handle different response structures
            if hasattr(response.choices[0].message, 'content'):
                text = response.choices[0].message.content
            elif hasattr(response.choices[0], 'text'):
                text = response.choices[0].text
            else:
                text = str(response.choices[0])
            
            logger.info(f"Extracted text: {text}")

            if not text or text.strip() == "":
                logger.error(f"Empty response - full response object: {response}")
                raise ValueError("Empty response from OpenAI")

            json_text = self._extract_first_json_object(text)
            result = json.loads(json_text)

            # Add usage info
            total_tokens = response.usage.total_tokens
            result["tokensUsed"] = total_tokens
            result["cost"] = calculate_cost(total_tokens)
            logger.info(
                "openai_request_end",
                extra={"model": self.model, "tokensUsed": total_tokens},
            )
            return result
            
        except json.JSONDecodeError as e:
            # Fallback if GPT doesn't return valid JSON
            logger.warning("openai_json_decode_error", extra={"error": str(e)})
            return {
                "status": "uncertain",
                "confidence": 0.1,
                "reasoning": "AI response parsing failed; using threshold fallback.",
                "primary_concern": None,
                "visual_assessment": None,
                "signals_agree": None,
                "recommended_action": "Manual inspection required",
                "tokensUsed": 0,
                "cost": "0.000000"
            }
            
        except Exception as e:
            # Generic error fallback
            logger.exception("openai_api_error", extra={"error": str(e)})
            return {
                "status": "uncertain",
                "confidence": 0.0,
                "reasoning": f"AI unavailable ({type(e).__name__}); using threshold fallback.",
                "primary_concern": None,
                "visual_assessment": None,
                "signals_agree": None,
                "recommended_action": "Check system logs and retry",
                "tokensUsed": 0,
                "cost": "0.000000"
            }
