from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path


PRODUCT_CATALOG = [
    {
        "product_code": "oss_storage",
        "category_code": "storage",
        "display_name": "对象存储OSS",
        "description": "基于旧项目 OSS 存储容量包与外网下行流量包价格表接入的存储类样板。",
    }
]


def _legacy_repo_root() -> Path:
    return Path(__file__).resolve().parents[4]


@lru_cache(maxsize=1)
def load_legacy_oss_data() -> list[dict]:
    data_path = _legacy_repo_root() / "oss.json"
    return json.loads(data_path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_legacy_stream_data() -> list[dict]:
    data_path = _legacy_repo_root() / "stream.json"
    return json.loads(data_path.read_text(encoding="utf-8"))


def list_storage_products() -> list[dict]:
    return PRODUCT_CATALOG


def _unique_specs(items: list[dict]) -> list[str]:
    specs = {
        str(item.get("规格", "")).strip()
        for item in items
        if str(item.get("规格", "")).strip()
    }

    return sorted(
        specs,
        key=lambda value: int(str(value).replace("G", "").strip()),
    )


def get_storage_option_sets() -> dict:
    return {
        "storage_specs": _unique_specs(load_legacy_oss_data()),
        "stream_specs": _unique_specs(load_legacy_stream_data()),
    }
