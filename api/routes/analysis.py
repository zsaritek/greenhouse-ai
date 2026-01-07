from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from models.schemas import AnalysisResult, SensorData
from services.context_service import get_24h_context
from services.mock_analyzer import get_analyzer
from services.openai_service import OpenAIService
from services.validator import ValidationService
from utils.cost_tracker import CostTracker
from utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analysis"])


def _force_uncertain_if_low_confidence(result: dict) -> dict:
    try:
        conf = float(result.get("confidence", 0.0))
    except Exception:
        conf = 0.0

    if conf < 0.3:
        result["status"] = "uncertain"
    return result


# NEW: Mock data analysis endpoints
@router.post("/start-analysis")
async def start_analysis():
    """Start analyzing mock data scenarios"""
    analyzer = get_analyzer()
    result = await analyzer.start_analysis()
    return result


@router.get("/analysis-status")
async def get_analysis_status():
    """Get current analysis progress and results"""
    analyzer = get_analyzer()
    return analyzer.get_status()


@router.get("/analysis/{analysis_id}")
async def get_analysis_detail(analysis_id: str):
    """Get single analysis result by ID"""
    analyzer = get_analyzer()
    result = analyzer.get_result_by_id(analysis_id)
    
    if result is None:
        raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found")
    
    return result


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    sensor_data: str = Form(..., description="JSON string containing sensor data"),
    image: Optional[UploadFile] = File(None, description="Optional plant image (JPG/PNG)"),
) -> AnalysisResult:
    """
    Multi-modal analysis endpoint: sensors + optional image.

    - Validates sensor data
    - Validates image (and flags low-quality as 'uncertain' instead of 500/422)
    - Enforces daily limit (144/day) with graceful fallback rules
    - Uses OpenAI model when available
    """
    # Parse + validate sensor JSON
    try:
        payload = json.loads(sensor_data)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"sensor_data must be valid JSON: {str(e)}")

    try:
        sensors = SensorData.model_validate(payload)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    # Build historical context
    ctx = get_24h_context(sensors.timestamp)
    historical = {"avgTemp": ctx.avgTemp, "trend": ctx.trend, "alerts": ctx.alerts}

    # Validate sensor completeness per assessment rule
    sensors_ok_for_ai, sensor_issue = ValidationService.validate_sensor_data(sensors)
    if not sensors_ok_for_ai:
        result = {
            "status": "uncertain",
            "confidence": 0.1,
            "reasoning": sensor_issue or "Insufficient sensor data for reliable analysis",
            "visual_assessment": None,
            "signals_agree": None,
            "primary_concern": None,
            "recommended_action": "Restore missing sensors and re-run analysis",
            "timestamp": sensors.timestamp,
            "tokensUsed": 0,
            "cost": "0.000000",
        }
        return AnalysisResult.model_validate(result)

    image_bytes: Optional[bytes] = None
    image_mime: Optional[str] = None

    if image is not None:
        image_bytes = await image.read()
        image_mime = image.content_type

        image_ok, image_issue = ValidationService.validate_image_bytes(image_bytes)
        if not image_ok:
            # Per requirements: blurry/dark/obstructed => uncertain (not a hard 422)
            result = {
                "status": "uncertain",
                "confidence": 0.2,
                "reasoning": f"Image quality issue: {image_issue}",
                "visual_assessment": None,
                "signals_agree": None,
                "primary_concern": "visual",
                "recommended_action": "Retake photo with better lighting/focus",
                "timestamp": sensors.timestamp,
                "tokensUsed": 0,
                "cost": "0.000000",
            }
            return AnalysisResult.model_validate(result)

    # Rate limiting (graceful fallback)
    limiter = RateLimiter(daily_limit=144)
    limit = limiter.check_limit()
    if not limit.get("allowed", True):
        logger.info("rate_limit_exceeded", extra=limit)
        fallback = ValidationService.get_fallback_analysis(sensors)
        fallback["reasoning"] = f"AI skipped (rate limit); {fallback.get('reasoning', '')}".strip()
        fallback["timestamp"] = sensors.timestamp
        return AnalysisResult.model_validate(_force_uncertain_if_low_confidence(fallback))

    # Use OpenAI
    try:
        service = OpenAIService()
        ai_result = await service.analyze_greenhouse(
            sensor_data={
                "timestamp": sensors.timestamp.isoformat(),
                "temperature": sensors.temperature,
                "humidity": sensors.humidity,
                "co2": sensors.co2,
                "soil_moisture": sensors.soil_moisture,
            },
            historical=historical,
            image_bytes=image_bytes,
            image_mime_type=image_mime,
        )

        ai_result = _force_uncertain_if_low_confidence(ai_result)
        ai_result["timestamp"] = sensors.timestamp

        # Track usage
        limiter.increment()
        CostTracker().add(int(ai_result.get("tokensUsed", 0) or 0))

        logger.info(
            "analysis_completed",
            extra={
                "status": ai_result.get("status"),
                "confidence": ai_result.get("confidence"),
                "tokensUsed": ai_result.get("tokensUsed"),
                "hasImage": bool(image_bytes),
            },
        )
        return AnalysisResult.model_validate(ai_result)

    except ValueError as e:
        # Missing API key or configuration
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("analysis_ai_failed_fallback", extra={"error": str(e)})
        fallback = ValidationService.get_fallback_analysis(sensors)
        fallback["reasoning"] = f"AI unavailable; {fallback.get('reasoning', '')}".strip()
        fallback["timestamp"] = sensors.timestamp
        return AnalysisResult.model_validate(_force_uncertain_if_low_confidence(fallback))
