export interface CatalogProduct {
  product_code: string;
  category_code: string;
  display_name: string;
  description: string;
}

export interface EcsSpec {
  spec_type: string;
  spec_name: string;
  vcpu: number;
  memory: number;
}

export interface OssOptionSets {
  storage_specs: string[];
  stream_specs: string[];
}

export interface QuoteCalculateRequest {
  product_code: string;
  category_code: string;
  region_code: string;
  billing_mode: string;
  period_months: number;
  quantity: number;
  config: Record<string, unknown>;
}

export interface QuotePriceItem {
  label: string;
  amount: number;
}

export interface QuoteCalculateResponse {
  product_code: string;
  category_code: string;
  product_name: string | null;
  sale_total_price: number;
  min_total_price: number;
  period_display: string;
  line_items: QuotePriceItem[];
  config_snapshot: Record<string, unknown>;
}
