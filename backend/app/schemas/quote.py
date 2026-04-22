from pydantic import BaseModel, Field


class EcsQuoteConfig(BaseModel):
    spec_type: str = Field("general", description="规格类型")
    vcpu: int = Field(..., ge=1, description="vCPU")
    memory: int = Field(..., ge=1, description="内存(GB)")


class QuoteCalculateRequest(BaseModel):
    product_code: str = Field(..., description="产品编码")
    category_code: str = Field(..., description="产品分类编码")
    region_code: str = Field("jiangxi", description="区域编码")
    billing_mode: str = Field("year_month", description="计费模式")
    period_months: int = Field(12, ge=1, description="购买月数")
    quantity: int = Field(1, ge=1, description="购买数量")
    config: dict = Field(default_factory=dict, description="产品配置快照")


class QuotePriceItem(BaseModel):
    label: str
    amount: float


class QuoteCalculateResponse(BaseModel):
    product_code: str
    category_code: str
    product_name: str | None = None
    sale_total_price: float
    min_total_price: float
    period_display: str
    line_items: list[QuotePriceItem] = Field(default_factory=list)
    config_snapshot: dict = Field(default_factory=dict)
