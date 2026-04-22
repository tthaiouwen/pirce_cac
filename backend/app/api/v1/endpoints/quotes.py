from fastapi import APIRouter

from app.schemas.quote import QuoteCalculateRequest, QuoteCalculateResponse
from app.services.quote_service import QuoteService

router = APIRouter()


@router.post("/calculate", response_model=QuoteCalculateResponse)
def calculate_quote(payload: QuoteCalculateRequest):
    return QuoteService().calculate(payload)
