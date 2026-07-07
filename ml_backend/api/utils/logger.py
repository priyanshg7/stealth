import logging
import sys

# Configure standard logging to output to console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def get_logger(name: str):
    return logging.getLogger(name)

# Expose a centralized instance
logger = get_logger("kisanmitra_backend")
