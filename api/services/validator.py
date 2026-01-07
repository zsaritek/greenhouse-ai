from __future__ import annotations

from typing import Optional, Tuple

from models.schemas import SensorData


class ValidationService:
    """Validate sensor data and handle missing/invalid values"""
    
    @staticmethod
    def validate_sensor_data(sensor_data: SensorData) -> Tuple[bool, Optional[str]]:
        """
        Validate sensor readings
        
        Returns:
            (is_usable_for_ai, message)
        """
        issues = []
        
        # Assessment rule: if ANY sensor is missing/invalid -> return 'uncertain'
        if sensor_data.temperature is None:
            issues.append("temperature_missing")
        if sensor_data.humidity is None:
            issues.append("humidity_missing")
        if sensor_data.co2 is None:
            issues.append("co2_missing")
        if sensor_data.soil_moisture is None:
            issues.append("soil_moisture_missing")

        if issues:
            return False, f"Missing/invalid sensor readings: {', '.join(issues)}"

        return True, None
    
    @staticmethod
    def validate_image_bytes(image_bytes: Optional[bytes]) -> Tuple[bool, Optional[str]]:
        """
        Validate uploaded image bytes (basic checks + lightweight quality heuristics).
        
        Returns:
            (is_valid, error_message)
        """
        if image_bytes is None:
            return True, None

        if len(image_bytes) > 10 * 1024 * 1024:
            return False, "Image too large (max 10MB)"

        try:
            # Lazy import: keep app importable even if Pillow isn't installed yet.
            from io import BytesIO

            from PIL import Image, ImageFilter, ImageStat

            with Image.open(BytesIO(image_bytes)) as img:
                if img.width < 100 or img.height < 100:
                    return False, "Image too small (min 100x100 pixels)"

                gray = img.convert("L").resize((256, 256))

                # Dark image heuristic
                brightness = ImageStat.Stat(gray).mean[0]
                if brightness < 25:
                    return False, "Image too dark for reliable visual assessment"

                # Blurry image heuristic via edge strength
                edges = gray.filter(ImageFilter.FIND_EDGES)
                edge_mean = ImageStat.Stat(edges).mean[0]
                if edge_mean < 6:
                    return False, "Image appears blurry/low-detail for reliable assessment"

            return True, None
        except ImportError:
            # Degrade gracefully: we can't validate blur/brightness without Pillow.
            return False, "Image validation unavailable (Pillow not installed)"
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
    
    @staticmethod
    def get_fallback_analysis(sensor_data: SensorData) -> dict:
        """
        Provide rule-based fallback analysis when AI is unavailable
        """
        alerts = []
        
        if sensor_data.temperature is not None and sensor_data.temperature > 35:
            alerts.append("High temperature detected (>35°C)")
        
        if sensor_data.temperature is not None and sensor_data.temperature < 15:
            alerts.append("Low temperature detected (<15°C)")
        
        if sensor_data.humidity is not None and sensor_data.humidity > 85:
            alerts.append("High humidity - fungal risk (>85%)")
        
        if sensor_data.co2 is not None and sensor_data.co2 < 350:
            alerts.append("Low CO₂ detected (<350ppm)")
        
        if sensor_data.soil_moisture is not None and sensor_data.soil_moisture < 30:
            alerts.append("Low soil moisture (<30%)")
        
        if len(alerts) > 0:
            return {
                "status": "potential_anomaly",
                "confidence": 0.65,
                "reasoning": " | ".join(alerts),
                "primary_concern": (
                    "temperature"
                    if sensor_data.temperature is not None
                    and (sensor_data.temperature > 35 or sensor_data.temperature < 15)
                    else None
                ),
                "visual_assessment": None,
                "signals_agree": None,
                "recommended_action": "Manual inspection recommended",
                "tokensUsed": 0,
                "cost": "0.000000",
                "timestamp": sensor_data.timestamp,
            }
        
        return {
            "status": "normal",
            "confidence": 0.90,
            "reasoning": "All sensors within normal ranges",
            "primary_concern": None,
            "visual_assessment": None,
            "signals_agree": None,
            "recommended_action": None,
            "tokensUsed": 0,
            "cost": "0.000000",
            "timestamp": sensor_data.timestamp,
        }
