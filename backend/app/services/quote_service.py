from app.schemas.quote import (
    QuoteCalculateRequest,
    QuoteCalculateResponse,
    QuotePriceItem,
)
from app.calculators.ecs import calculate_ecs_quote
from app.calculators.network import calculate_internet_bandwidth_quote
from app.calculators.storage import calculate_oss_storage_quote


class QuoteService:
    def calculate(self, payload: QuoteCalculateRequest) -> QuoteCalculateResponse:
        if payload.product_code == "ecs":
            result = calculate_ecs_quote(
                {
                    **payload.config,
                    "quantity": payload.quantity,
                    "period_months": payload.period_months,
                }
            )
            return QuoteCalculateResponse(**result)

        if payload.product_code == "internet_bandwidth":
            result = calculate_internet_bandwidth_quote(
                {
                    **payload.config,
                    "quantity": payload.quantity,
                    "period_months": payload.period_months,
                }
            )
            return QuoteCalculateResponse(**result)

        if payload.product_code == "oss_storage":
            result = calculate_oss_storage_quote(
                {
                    **payload.config,
                    "quantity": payload.quantity,
                    "period_months": payload.period_months,
                }
            )
            return QuoteCalculateResponse(**result)

        base_unit_price = 100.0
        sale_total = round(base_unit_price * payload.quantity * payload.period_months, 2)
        min_total = round(sale_total * 0.7, 2)

        return QuoteCalculateResponse(
            product_code=payload.product_code,
            category_code=payload.category_code,
            product_name="示例产品",
            sale_total_price=sale_total,
            min_total_price=min_total,
            period_display=f"{payload.period_months}个月",
            line_items=[
                QuotePriceItem(label="基础费用", amount=sale_total),
            ],
            config_snapshot=payload.config,
        )
