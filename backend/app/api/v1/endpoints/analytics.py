from fastapi import APIRouter

router = APIRouter()


@router.get("/overview")
def analytics_overview():
    return {
        "daily_quote_count": 0,
        "active_users": 0,
        "top_products": [],
    }
