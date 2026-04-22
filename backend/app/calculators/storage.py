from __future__ import annotations

from app.product_registry.storage import load_legacy_oss_data, load_legacy_stream_data


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


def _match_period(item_period: str | int, period_months: int) -> bool:
    if isinstance(item_period, int):
        return item_period == period_months

    normalized = str(item_period).strip()
    if normalized.endswith("个月"):
        return int(normalized.replace("个月", "")) == period_months
    if normalized.endswith("年"):
        return int(normalized.replace("年", "")) * 12 == period_months
    if normalized.isdigit():
        return int(normalized) == period_months
    return False


def _find_price_config(items: list[dict], spec: str, period_months: int) -> dict | None:
    for item in items:
        if str(item.get("规格", "")).strip() != spec:
            continue
        if _match_period(item.get("购买时长", ""), period_months):
            return item
    return None


def _to_price(value: str | int | float | None) -> float:
    if value in (None, "", "无"):
        return 0.0
    return round(float(value), 2)


def calculate_oss_storage_quote(config: dict) -> dict:
    storage_spec = str(config.get("storage_spec", "")).strip()
    storage_quantity = int(config.get("storage_quantity", 1))
    stream_spec = str(config.get("stream_spec", "")).strip()
    stream_quantity = int(config.get("stream_quantity", 0))
    period_months = int(config.get("period_months", 12))

    if not storage_spec:
        raise ValueError("请选择 OSS 存储容量包规格")

    if storage_quantity <= 0:
        raise ValueError("存储容量包数量必须大于 0")

    if stream_quantity < 0:
        raise ValueError("流量包数量不能小于 0")

    oss_config = _find_price_config(load_legacy_oss_data(), storage_spec, period_months)
    if not oss_config:
        raise ValueError(f"未找到 OSS 存储规格 {storage_spec} 在当前周期的价格")

    oss_sale = _to_price(oss_config.get("销售价")) * storage_quantity
    oss_min = _to_price(oss_config.get("最低限价")) * storage_quantity

    stream_sale = 0.0
    stream_min = 0.0
    line_items = [
        {
            "label": f"存储容量包 {storage_spec} x {storage_quantity}",
            "amount": round(oss_sale, 2),
        }
    ]

    if stream_spec and stream_quantity > 0:
        stream_config = _find_price_config(load_legacy_stream_data(), stream_spec, period_months)
        if not stream_config:
            raise ValueError(f"未找到流量包规格 {stream_spec} 在当前周期的价格")

        stream_sale = _to_price(stream_config.get("销售价")) * stream_quantity
        stream_min = _to_price(stream_config.get("最低限价")) * stream_quantity
        line_items.append(
            {
                "label": f"外网下行流量包 {stream_spec} x {stream_quantity}",
                "amount": round(stream_sale, 2),
            }
        )

    return {
        "product_code": "oss_storage",
        "category_code": "storage",
        "product_name": "对象存储OSS",
        "sale_total_price": round(oss_sale + stream_sale, 2),
        "min_total_price": round(oss_min + stream_min, 2),
        "period_display": _resolve_period_display(period_months),
        "line_items": line_items,
        "config_snapshot": {
            "storage_spec": storage_spec,
            "storage_quantity": storage_quantity,
            "stream_spec": stream_spec,
            "stream_quantity": stream_quantity,
            "period_months": period_months,
        },
    }
