from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator, AliasChoices


class SensorData(BaseModel):
    """
    Sensor payload accepted by POST /api/analyze.

    Expected frontend keys:
    - temperature, humidity, co2, soilMoisture, timestamp

    Supported aliases for resilience:
    - temp -> temperature
    - soil_moisture -> soilMoisture
    """

    model_config = {"populate_by_name": True}

    timestamp: datetime = Field(..., description="ISO timestamp for the reading")
    temperature: Optional[float] = Field(
        default=None,
        ge=-20,
        le=60,
        validation_alias=AliasChoices("temperature", "temp"),
        description="Temperature in Celsius",
    )
    humidity: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        description="Humidity percentage",
    )
    co2: Optional[float] = Field(
        default=None,
        ge=0,
        le=10000,
        description="CO2 in ppm",
    )
    soil_moisture: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        validation_alias=AliasChoices("soilMoisture", "soil_moisture"),
        description="Soil moisture percentage",
    )


class AnalysisResult(BaseModel):
    """Response payload returned by POST /api/analyze."""

    model_config = {"populate_by_name": True}

    status: Literal["normal", "potential_anomaly", "uncertain"]
    confidence: float = Field(..., ge=0, le=1)
    reasoning: str = Field(..., max_length=500)
    visual_assessment: Optional[str] = None
    signals_agree: Optional[bool] = None
    primary_concern: Optional[
        Literal["temperature", "humidity", "co2", "soil_moisture", "visual"]
    ] = None
    recommended_action: Optional[str] = None

    # Mirror the assessment contract naming
    timestamp: datetime = Field(
        default_factory=lambda: datetime.utcnow(),
        description="Timestamp associated with this analysis (usually the reading timestamp).",
    )

    tokens_used: int = Field(default=0, alias="tokensUsed")
    cost: str = Field(default="0.000000")
