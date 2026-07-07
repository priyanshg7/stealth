from fastapi import Request
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api.middleware")

async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    logger.info(f"{request.method} {request.url.path} completed in {process_time:.2f}ms")
    return response
