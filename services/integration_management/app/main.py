from fastapi import FastAPI
import uvicorn
from app.routes.zoom_routes import router as zoom_router
from app.routes.google_routes import router as google_router
from app.routes.teams_routes import router as teams_router
from app.utils.logger import setup_logging
from app.utils.error_handler import register_handlers
#from app.db import create_tables

# Setup logging
setup_logging()

# FastAPI app
app = FastAPI(title="Integration Management (Zoom/Google/Teams)")

# Startup
@app.on_event("startup")
async def startup():
    #create_tables()  # ensure tables exist
    register_handlers(app)

# Routers
app.include_router(zoom_router)
app.include_router(google_router)
app.include_router(teams_router)

# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}

# Dev server
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=3009, reload=True)
