from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "recommendation-engine"}


@router.get("/ready")
async def readiness_check():
    return {"status": "ready"}
