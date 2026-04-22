from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path


SPEC_TYPE_LABELS = {
    "general": "通用型",
    "compute": "计算增强型",
    "network": "网络增强型",
    "storage": "存储增强型",
}

PRODUCT_CATALOG = [
    {
        "product_code": "ecs",
        "category_code": "compute",
        "display_name": "云服务器 ECS",
        "description": "首个迁移样板产品，使用旧项目 ECS 价格数据做新架构接入演示。",
    }
]


def _legacy_repo_root() -> Path:
    return Path(__file__).resolve().parents[4]


@lru_cache(maxsize=1)
def load_legacy_ecs_data() -> list[dict]:
    data_path = _legacy_repo_root() / "ecs.json"
    return json.loads(data_path.read_text(encoding="utf-8"))


def list_compute_products() -> list[dict]:
    return PRODUCT_CATALOG


def list_ecs_specs(spec_type: str = "general") -> list[dict]:
    spec_label = SPEC_TYPE_LABELS.get(spec_type, SPEC_TYPE_LABELS["general"])
    specs: list[dict] = []

    for item in load_legacy_ecs_data():
        product_name = item.get("产品", "")
        if spec_label not in product_name:
            continue
        specs.append(
            {
                "spec_type": spec_type,
                "spec_name": product_name,
                "vcpu": int(item.get("vcpu-核", 0)),
                "memory": int(item.get("内存-G", 0)),
            }
        )

    specs.sort(key=lambda spec: (spec["vcpu"], spec["memory"]))
    return specs


def find_ecs_price_config(spec_type: str, vcpu: int, memory: int) -> dict | None:
    spec_label = SPEC_TYPE_LABELS.get(spec_type, SPEC_TYPE_LABELS["general"])

    for item in load_legacy_ecs_data():
        product_name = item.get("产品", "")
        if spec_label not in product_name:
            continue
        if int(item.get("vcpu-核", 0)) == int(vcpu) and int(item.get("内存-G", 0)) == int(memory):
            return item
    return None
