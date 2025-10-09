from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

def register_handlers(app: FastAPI):
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logging.exception("Unhandled exception")
        return JSONResponse({"error": "internal_server_error"}, status_code=500)
