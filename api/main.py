import os
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.analysis import router as analysis_router
from utils.logging_config import configure_logging


def create_app() -> FastAPI:
    load_dotenv()
    configure_logging()

    app = FastAPI(
        title="Greenhouse Monitor API",
        version="0.1.0",
    )

    allowed_origins = [
        "http://localhost:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount static files for images
    mock_data_path = Path(__file__).parent / "mock_data"
    app.mount("/api/mock_data", StaticFiles(directory=str(mock_data_path)), name="mock_data")

    app.include_router(analysis_router)

    @app.get("/health")
    async def health() -> dict:
        try:
            import openai  # type: ignore

            openai_version = getattr(openai, "__version__", None)
        except Exception:
            openai_version = None

        return {
            "status": "ok",
            "openaiConfigured": bool(os.getenv("OPENAI_API_KEY")),
            "openaiModel": os.getenv("OPENAI_MODEL", "gpt-5-nano"),
            "openaiSdkVersion": openai_version,
            "pythonVersion": sys.version.split(" ")[0],
        }

    logging.getLogger(__name__).info("app_started")
    return app


app = create_app()
