from __future__ import annotations

from app.product_registry.compute import find_ecs_price_config


def _resolve_period_label(period_months: int) -> tuple[str, str, int]:
    if period_months <= 11:
        return "1-11个月", f"{period_months}个月", period_months
    if period_months == 12:
        return "1年", "1年", 12
    if period_months == 24:
        return "2年", "2年", 24
    if period_months == 36:
        return "3年", "3年", 36
    if period_months == 48:
        return "3年", "4年", 48
    if period_months == 60:
        return "3年", "5年", 60
    return "1-11个月", f"{period_months}个月", period_months


def _read_period_price(config: dict, prefix: str, period_label: str) -> float:
    direct_key = f"{prefix}\n{period_label}"
    if direct_key in config:
        return float(config[direct_key])

    spaced_key = f"{prefix} {period_label}"
    if spaced_key in config:
        return float(config[spaced_key])

    for key, value in config.items():
        normalized_key = " ".join(str(key).split())
        if prefix in normalized_key and period_label in normalized_key:
            return float(value)

    raise ValueError(f"未找到价格字段: {prefix} {period_label}")


def calculate_ecs_quote(config: dict) -> dict:
    spec_type = config.get("spec_type", "general")
    vcpu = int(config.get("vcpu", 0))
    memory = int(config.get("memory", 0))
    quantity = int(config.get("quantity", 1))
    period_months = int(config.get("period_months", 12))

    matched = find_ecs_price_config(spec_type, vcpu, memory)
    if not matched:
        raise ValueError(f"未找到 ECS 配置: spec_type={spec_type}, vcpu={vcpu}, memory={memory}")

    price_period_label, display_period, total_months = _resolve_period_label(period_months)
    sale_monthly = _read_period_price(matched, "销售价-月单价", price_period_label)
    min_monthly = _read_period_price(matched, "最低限价-月单价", price_period_label)

    sale_total = round(sale_monthly * total_months * quantity, 2)
    min_total = round(min_monthly * total_months * quantity, 2)

    return {
        "product_code": "ecs",
        "category_code": "compute",
        "product_name": matched.get("产品", "云服务器 ECS"),
        "sale_total_price": sale_total,
        "min_total_price": min_total,
        "period_display": display_period,
        "line_items": [
            {
                "label": f"{matched.get('产品', '云服务器 ECS')} x {quantity}",
                "amount": sale_total,
            }
        ],
        "config_snapshot": {
            "spec_type": spec_type,
            "vcpu": vcpu,
            "memory": memory,
            "quantity": quantity,
            "period_months": period_months,
        },
    }
