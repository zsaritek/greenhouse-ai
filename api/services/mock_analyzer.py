"""
Mock data analyzer service
Processes mock scenarios one-by-one with progressive results
"""
import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional

from services.context_service import get_24h_context
from services.openai_service import OpenAIService

logger = logging.getLogger(__name__)


class MockAnalyzer:
    """Analyzes mock data scenarios progressively"""
    
    def __init__(self):
        self.is_processing = False
        self.results: List[Dict] = []
        self.total = 0
        self.completed = 0
        self.mock_data_path = Path(__file__).parent.parent / "mock_data"
        
        # Load existing results on startup if available
        self._load_cached_results()
        
    def _load_cached_results(self):
        """Load previously analyzed results from file"""
        try:
            results_file = self.mock_data_path / "analyzed_results.json"
            if results_file.exists():
                with open(results_file, 'r') as f:
                    self.results = json.load(f)
                    self.completed = len(self.results)
                    self.total = len(self.results)
                logger.info(f"Loaded {len(self.results)} cached analysis results")
        except Exception as e:
            logger.warning(f"Could not load cached results: {e}")
    
    def get_status(self) -> Dict:
        """Get current processing status"""
        return {
            "status": "processing" if self.is_processing else "complete",
            "completed": self.completed,
            "total": self.total,
            "results": self.results
        }
    
    def get_result_by_id(self, result_id: str) -> Optional[Dict]:
        """Get single result by ID"""
        for result in self.results:
            if result.get("id") == result_id:
                return result
        return None
    
    async def start_analysis(self) -> Dict:
        """Start analyzing mock data in background"""
        if self.is_processing:
            return {"error": "Analysis already in progress"}
        
        # Clear previous results
        self.results = []
        self.completed = 0
        self.is_processing = True
        
        # Load mock data - default to comprehensive data.json
        try:
            data_file = self.mock_data_path / "data.json"
            with open(data_file, 'r') as f:
                mock_scenarios = json.load(f)
            
            self.total = len(mock_scenarios)
            
            # Start background task
            asyncio.create_task(self._process_scenarios(mock_scenarios))
            
            return {
                "status": "started",
                "total": self.total
            }
        except Exception as e:
            logger.error(f"Failed to start analysis: {e}")
            self.is_processing = False
            return {"error": str(e)}
    
    async def _process_scenarios(self, scenarios: List[Dict]):
        """Process scenarios one by one"""
        try:
            service = OpenAIService()
            
            for scenario in scenarios:
                # Load image
                image_path = self.mock_data_path / "images" / scenario["image"]
                image_bytes = None
                
                if image_path.exists():
                    with open(image_path, 'rb') as f:
                        image_bytes = f.read()
                
                # Validate image quality BEFORE calling AI
                from services.validator import ValidationService
                
                if image_bytes:
                    image_ok, image_issue = ValidationService.validate_image_bytes(image_bytes)
                    if not image_ok:
                        # Return uncertain result without calling AI
                        result = {
                            "status": "uncertain",
                            "confidence": 0.2,
                            "reasoning": f"Image quality issue: {image_issue}",
                            "visual_assessment": None,
                            "signals_agree": None,
                            "primary_concern": "visual",
                            "recommended_action": "Retake photo with better lighting/focus and retry analysis",
                            "tokensUsed": 0,
                            "cost": "0.000000"
                        }
                        
                        # Add metadata
                        result["id"] = scenario["id"]
                        result["timestamp"] = scenario["timestamp"]
                        result["location"] = scenario.get("location", "Unknown Location")
                        result["camera_id"] = scenario.get("camera_id", "Unknown Camera")
                        result["sensorData"] = {
                            "temperature": scenario["temperature"],
                            "humidity": scenario["humidity"],
                            "co2": scenario["co2"],
                            "soilMoisture": scenario["soilMoisture"]
                        }
                        result["image"] = scenario["image"]
                        
                        if "pagerAlert" in scenario:
                            result["pagerAlert"] = scenario["pagerAlert"]
                        
                        self.results.append(result)
                        self.completed += 1
                        logger.info(f"Completed analysis {self.completed}/{self.total}: {scenario['id']} (image quality failure)")
                        continue
                
                # Check for missing sensors
                if scenario.get("temperature") is None:
                    result = {
                        "status": "uncertain",
                        "confidence": 0.1,
                        "reasoning": "Missing temperature sensor data - cannot perform reliable analysis",
                        "visual_assessment": None,
                        "signals_agree": None,
                        "primary_concern": "sensors",
                        "recommended_action": "Restore temperature sensor and retry analysis",
                        "tokensUsed": 0,
                        "cost": "0.000000"
                    }
                    
                    # Add metadata
                    result["id"] = scenario["id"]
                    result["timestamp"] = scenario["timestamp"]
                    result["location"] = scenario.get("location", "Unknown Location")
                    result["camera_id"] = scenario.get("camera_id", "Unknown Camera")
                    result["sensorData"] = {
                        "temperature": scenario["temperature"],
                        "humidity": scenario["humidity"],
                        "co2": scenario["co2"],
                        "soilMoisture": scenario["soilMoisture"]
                    }
                    result["image"] = scenario["image"]
                    
                    if "pagerAlert" in scenario:
                        result["pagerAlert"] = scenario["pagerAlert"]
                    
                    self.results.append(result)
                    self.completed += 1
                    logger.info(f"Completed analysis {self.completed}/{self.total}: {scenario['id']} (missing sensor)")
                    continue
                
                # Analyze with AI
                from datetime import datetime
                timestamp = datetime.fromisoformat(scenario["timestamp"].replace('Z', '+00:00'))
                ctx = get_24h_context(timestamp)
                
                result = await service.analyze_greenhouse(
                    sensor_data={
                        "timestamp": scenario["timestamp"],
                        "temperature": scenario["temperature"],
                        "humidity": scenario["humidity"],
                        "co2": scenario["co2"],
                        "soil_moisture": scenario["soilMoisture"]
                    },
                    historical={
                        "avgTemp": ctx.avgTemp,
                        "trend": ctx.trend,
                        "alerts": ctx.alerts
                    },
                    image_bytes=image_bytes,
                    image_mime_type="image/jpeg"
                )
                
                # Add metadata
                result["id"] = scenario["id"]
                result["timestamp"] = scenario["timestamp"]
                result["location"] = scenario.get("location", "Unknown Location")
                result["camera_id"] = scenario.get("camera_id", "Unknown Camera")
                result["sensorData"] = {
                    "temperature": scenario["temperature"],
                    "humidity": scenario["humidity"],
                    "co2": scenario["co2"],
                    "soilMoisture": scenario["soilMoisture"]
                }
                result["image"] = scenario["image"]
                
                # Add pager alert if present
                if "pagerAlert" in scenario:
                    result["pagerAlert"] = scenario["pagerAlert"]
                
                # Store result
                self.results.append(result)
                self.completed += 1
                
                logger.info(f"Completed analysis {self.completed}/{self.total}: {scenario['id']}")
                
            # Save results to file
            results_file = self.mock_data_path / "analyzed_results.json"
            with open(results_file, 'w') as f:
                json.dump(self.results, f, indent=2, default=str)
            
        except Exception as e:
            logger.exception(f"Error processing scenarios: {e}")
        finally:
            self.is_processing = False


# Global instance
_analyzer = MockAnalyzer()


def get_analyzer() -> MockAnalyzer:
    """Get global analyzer instance"""
    return _analyzer
