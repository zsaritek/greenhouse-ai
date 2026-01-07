import logging
import os


def configure_logging() -> None:
    """
    Configure structured JSON logging.

    Notes:
    - Keeps output simple for local dev while remaining machine-parseable.
    - You can extend this with request IDs, trace IDs, etc.
    """
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    handler = logging.StreamHandler()
    try:
        from pythonjsonlogger import jsonlogger

        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s"
        )
        handler.setFormatter(formatter)
    except ImportError:
        # Graceful fallback so the app can run even before optional deps are installed.
        formatter = logging.Formatter(
            fmt="%(asctime)s %(levelname)s %(name)s %(message)s"
        )
        handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers = []
    root.addHandler(handler)
    root.setLevel(level)


