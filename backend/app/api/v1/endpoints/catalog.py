from fastapi import APIRouter, Query

from app.product_registry.compute import list_compute_products, list_ecs_specs
from app.product_registry.network import list_network_products
from app.product_registry.storage import list_storage_products, get_storage_option_sets

router = APIRouter()


@router.get("/products")
def list_products():
    return {
        "items": list_compute_products() + list_network_products() + list_storage_products(),
    }


@router.get("/products/ecs/specs")
def list_product_specs(spec_type: str = Query(default="general")):
    return {
        "items": list_ecs_specs(spec_type=spec_type),
    }


@router.get("/products/oss/options")
def list_storage_options():
    return {
        "items": get_storage_option_sets(),
    }
