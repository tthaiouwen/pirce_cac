from __future__ import annotations


def _resolve_period_display(period_months: int) -> str:
    if period_months == 12:
        return "1年"
    if period_months == 24:
        return "2年"
    if period_months == 36:
        return "3年"
    if period_months == 48:
        return "4年"
    if period_months == 60:
        return "5年"
    return f"{period_months}个月"


def calculate_internet_bandwidth_quote(config: dict) -> dict:
    bandwidth = int(config.get("bandwidth", 0))
    period_months = int(config.get("period_months", 12))
    quantity = int(config.get("quantity", 1))

    if bandwidth <= 0:
        raise ValueError("互联网带宽必须大于 0M")

    if bandwidth <= 5:
        sale_price_per_m = 20.0
        min_price_per_m = 8.0
    elif bandwidth <= 10:
        sale_price_per_m = 24.0
        min_price_per_m = 9.6
    else:
        sale_price_per_m = 35.0
        min_price_per_m = 14.0

    sale_total = round(sale_price_per_m * bandwidth * period_months * quantity, 2)
    min_total = round(min_price_per_m * bandwidth * period_months * quantity, 2)

    return {
        "product_code": "internet_bandwidth",
        "category_code": "network",
        "product_name": "互联网带宽（包括IPv4公网带宽和IPv6带宽）",
        "sale_total_price": sale_total,
        "min_total_price": min_total,
        "period_display": _resolve_period_display(period_months),
        "line_items": [
            {
                "label": f"互联网带宽 {bandwidth}M x {quantity}",
                "amount": sale_total,
            }
        ],
        "config_snapshot": {
            "bandwidth": bandwidth,
            "quantity": quantity,
            "period_months": period_months,
        },
    }
