from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.zoom_model import ZoomIntegration
from app.models.google_meet import GoogleIntegration
from app.models.team_model import TeamsIntegration

router = APIRouter(prefix="/integrations", tags=["integrations"])

@router.get("/me")
async def my_integrations(user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = []
    qz = select(ZoomIntegration).where(ZoomIntegration.user_id == user.id)
    gz = await db.execute(qz)
    zooms = gz.scalars().all()
    if zooms:
        res.append({"provider":"zoom", "count": len(zooms)})

    qg = select(GoogleIntegration).where(GoogleIntegration.user_id == user.id)
    gg = await db.execute(qg)
    googles = gg.scalars().all()
    if googles:
        res.append({"provider":"google", "count": len(googles)})

    qt = select(TeamsIntegration).where(TeamsIntegration.user_id == user.id)
    gt = await db.execute(qt)
    teams = gt.scalars().all()
    if teams:
        res.append({"provider":"microsoft", "count": len(teams)})

    return {"integrations": res}
