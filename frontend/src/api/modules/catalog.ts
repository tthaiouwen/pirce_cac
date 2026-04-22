import { http } from "@/api/http";
import type { CatalogProduct, EcsSpec, OssOptionSets } from "@/types/quote";

export async function getCatalogProducts() {
  const response = await http.get<{ items: CatalogProduct[] }>("/catalog/products");
  return response.data.items;
}

export async function getEcsSpecs(specType: string) {
  const response = await http.get<{ items: EcsSpec[] }>("/catalog/products/ecs/specs", {
    params: { spec_type: specType }
  });
  return response.data.items;
}

export async function getOssOptions() {
  const response = await http.get<{ items: OssOptionSets }>("/catalog/products/oss/options");
  return response.data.items;
}
