PRODUCT_CATALOG = [
    {
        "product_code": "internet_bandwidth",
        "category_code": "network",
        "display_name": "互联网带宽",
        "description": "基于带宽值阶梯单价计算的网络类迁移样板。",
    }
]


def list_network_products() -> list[dict]:
    return PRODUCT_CATALOG
