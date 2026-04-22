import { defineStore } from "pinia";
import { getCatalogProducts, getEcsSpecs, getOssOptions } from "@/api/modules/catalog";
import { calculateQuote } from "@/api/modules/quotes";
import type { CatalogProduct, EcsSpec, OssOptionSets, QuoteCalculateResponse } from "@/types/quote";

type EcsSpecType = "general" | "compute" | "network" | "storage";
type ProductCategory = "compute" | "network" | "storage" | "security";
type NetworkProductCode = "internet_bandwidth" | "shared_bandwidth" | "slb" | "nat_gateway";
type MainTabKey = "calculator" | "config-list" | "price-list";

interface ProductOption {
  product_code: string;
  display_name: string;
}

interface ConfigListItem {
  id: string;
  region: string;
  product_name: string;
  config_detail: string;
  quantity: number;
  duration_text: string;
  catalog_price: number;
  discount_price: number;
  year1_total: number;
  year2_total: number;
}

interface SecurityProductItem {
  key: string;
  label: string;
  expanded: boolean;
  quantityLabel: string;
  hint: string;
  quantity: number;
}

interface ComputeFlavorTab {
  label: string;
  value: EcsSpecType;
}

export const useQuoteWorkbenchStore = defineStore("quote-workbench", {
  state: () => ({
    products: [] as CatalogProduct[],
    ecsSpecs: [] as EcsSpec[],
    currentTab: "calculator" as MainTabKey,
    showProjectModal: false,
    projectName: "测试项目001",
    projectCity: "",
    industry: "教育",
    regionCode: "",
    billingTypeLabel: "包年包月",
    selectedCategory: "compute" as ProductCategory,
    selectedProductCode: "ecs",
    selectedNetworkProductCode: "internet_bandwidth" as NetworkProductCode,
    selectedSpecType: "general" as EcsSpecType,
    selectedSpecKey: "",
    computeArchitecture: "x86",
    computeFlavorTabs: [
      { label: "通用型", value: "general" },
      { label: "内存型", value: "compute" },
      { label: "网络增强型", value: "network" }
    ] as ComputeFlavorTab[],
    systemDiskType: "",
    systemDiskSize: "",
    dataDiskItems: [
      { id: "disk-1", diskType: "", diskSize: "", quantity: 1 },
      { id: "disk-2", diskType: "", diskSize: "", quantity: 1 }
    ],
    ossOptions: {
      storage_specs: [],
      stream_specs: []
    } as OssOptionSets,
    storageSpec: "",
    storageQuantity: 1,
    streamSpec: "",
    streamQuantity: 0,
    bandwidth: 5,
    securityComplianceLevel: "level3",
    securityProducts: [
      { key: "host_security", label: "云主机安全", expanded: true, quantityLabel: "资产数量", hint: "最高支持1000个终端资产", quantity: 1 },
      { key: "cloud_firewall", label: "云防火墙", expanded: true, quantityLabel: "资产数量", hint: "标准版套餐示意，后续接真实规则", quantity: 1 },
      { key: "vulnerability_scan", label: "云漏洞扫描", expanded: true, quantityLabel: "资产数量", hint: "最高支持120个资产", quantity: 1 },
      { key: "bastion_host", label: "云堡垒机", expanded: true, quantityLabel: "资产数量", hint: "最高支持1000个资产", quantity: 1 },
      { key: "web_app_firewall", label: "云WEB应用防火墙", expanded: true, quantityLabel: "站点数量", hint: "最高支持20个站点", quantity: 1 },
      { key: "anti_tampering", label: "云防篡改", expanded: true, quantityLabel: "资产数量", hint: "最高支持50个根目录", quantity: 1 },
      { key: "database_audit", label: "云数据库审计", expanded: true, quantityLabel: "资产数量", hint: "最高支持30个数据库", quantity: 1 },
      { key: "log_audit", label: "云综合日志审计", expanded: true, quantityLabel: "资产数量", hint: "最高支持500个日志源", quantity: 1 }
    ] as SecurityProductItem[],
    quantity: 1,
    periodMonths: 12,
    monthlySelection: "",
    configList: [] as ConfigListItem[],
    quoteResult: null as QuoteCalculateResponse | null,
    loading: false
  }),
  getters: {
    selectedSpec(state) {
      return (
        state.ecsSpecs.find(
          (item) => `${item.vcpu}-${item.memory}-${item.spec_type}` === state.selectedSpecKey
        ) || null
      );
    },
    categoryOptions(): Array<{ label: string; value: ProductCategory }> {
      return [
        { label: "计算类", value: "compute" },
        { label: "网络类", value: "network" },
        { label: "存储类", value: "storage" },
        { label: "安全类", value: "security" }
      ];
    },
    productOptionsBySelectedCategory(state): ProductOption[] {
      if (state.selectedCategory === "compute") {
        return state.products
          .filter((item) => item.category_code === "compute")
          .map((item) => ({
            product_code: item.product_code,
            display_name: item.display_name
          }));
      }

      if (state.selectedCategory === "network") {
        return [
          { product_code: "internet_bandwidth", display_name: "互联网带宽" },
          { product_code: "shared_bandwidth", display_name: "共享带宽" },
          { product_code: "slb", display_name: "负载均衡SLB" },
          { product_code: "nat_gateway", display_name: "NAT网关" }
        ];
      }

      if (state.selectedCategory === "storage") {
        return [{ product_code: "oss_storage", display_name: "对象存储OSS" }];
      }

      return [{ product_code: "cloud_security", display_name: "云安全" }];
    },
    durationOptions(): Array<{ label: string; value: number | string }> {
      return [
        { label: "1年", value: 12 },
        { label: "2年", value: 24 },
        { label: "3年", value: 36 },
        { label: "4年", value: 48 },
        { label: "5年", value: 60 },
        { label: "< 1年", value: "custom" }
      ];
    },
    durationText(state): string {
      if (state.periodMonths === 12) return "1年";
      if (state.periodMonths === 24) return "2年";
      if (state.periodMonths === 36) return "3年";
      if (state.periodMonths === 48) return "4年";
      if (state.periodMonths === 60) return "5年";
      return `${state.periodMonths}个月`;
    },
    priceListRows(state): Array<Record<string, string | number>> {
      if (state.selectedCategory === "compute") {
        return state.ecsSpecs.slice(0, 10).map((item) => ({
          category: "计算类",
          product_name: "云服务器ECS",
          spec_name: item.spec_name,
          vcpu: item.vcpu,
          memory: item.memory,
          package_price: "--",
          price_1y: "--",
          price_2y: "--",
          price_3y: "--",
          min_package_price: "--",
          min_1y: "--",
          min_2y: "--",
          min_3y: "--"
        }));
      }

      if (state.selectedCategory === "network") {
        return [
          {
            category: "网络类",
            product_name: "互联网带宽",
            spec_name: "基础型",
            vcpu: "-",
            memory: "-",
            package_price: "按带宽值",
            price_1y: "阶梯计价",
            price_2y: "阶梯计价",
            price_3y: "阶梯计价",
            min_package_price: "阶梯计价",
            min_1y: "阶梯计价",
            min_2y: "阶梯计价",
            min_3y: "阶梯计价"
          }
        ];
      }

      if (state.selectedCategory === "storage") {
        return state.ossOptions.storage_specs.slice(0, 8).map((spec) => ({
          category: "存储类",
          product_name: "对象存储OSS",
          spec_name: spec,
          vcpu: "-",
          memory: "-",
          package_price: "容量包",
          price_1y: state.storageSpec === spec ? "当前选中" : "--",
          price_2y: "--",
          price_3y: "--",
          min_package_price: "容量包",
          min_1y: "--",
          min_2y: "--",
          min_3y: "--"
        }));
      }

      return [
        {
          category: state.selectedCategory === "security" ? "安全类" : "存储类",
          product_name: state.selectedCategory === "security" ? "云安全" : "对象存储OSS",
          spec_name: "待接入",
          vcpu: "-",
          memory: "-",
          package_price: "--",
          price_1y: "--",
          price_2y: "--",
          price_3y: "--",
          min_package_price: "--",
          min_1y: "--",
          min_2y: "--",
          min_3y: "--"
        }
      ];
    },
    guideSteps(): Array<{ title: string; desc: string }> {
      return [
        { title: "选择产品类型", desc: "从计算类、网络类、安全类中选择您需要的产品类型" },
        { title: "选择具体产品", desc: "根据产品类型选择对应的具体产品名称" },
        { title: "配置产品规格", desc: "根据业务需求配置产品的规格和参数" },
        { title: "查看价格估算", desc: "系统将自动计算并显示产品的价格信息" }
      ];
    },
    showGuideCard(state): boolean {
      return state.currentTab === "calculator" && !state.quoteResult && !state.configList.length;
    },
    configListSummary(state): { discountTotal: number; year1Total: number; year2Total: number } {
      return state.configList.reduce(
        (summary, item) => {
          summary.discountTotal += item.discount_price;
          summary.year1Total += item.year1_total;
          summary.year2Total += item.year2_total;
          return summary;
        },
        {
          discountTotal: 0,
          year1Total: 0,
          year2Total: 0
        }
      );
    }
  },
  actions: {
    async initialize() {
      this.products = await getCatalogProducts();
      this.syncCategorySelection();
      await this.loadCurrentProductData();
    },
    setTab(tab: MainTabKey) {
      this.currentTab = tab;
    },
    openProjectModal() {
      this.showProjectModal = true;
    },
    closeProjectModal() {
      this.showProjectModal = false;
    },
    resetProjectForm() {
      this.projectName = "";
      this.projectCity = "";
      this.industry = "";
      this.regionCode = "";
    },
    setCategory(category: ProductCategory) {
      this.selectedCategory = category;
      this.syncCategorySelection();
    },
    syncCategorySelection() {
      if (this.selectedCategory === "compute") {
        this.selectedProductCode = "ecs";
        return;
      }

      if (this.selectedCategory === "network") {
        this.selectedProductCode = this.selectedNetworkProductCode;
        return;
      }

      if (this.selectedCategory === "storage") {
        this.selectedProductCode = "oss_storage";
        return;
      }

      this.selectedProductCode = "cloud_security";
    },
    setNetworkProduct(productCode: NetworkProductCode) {
      this.selectedNetworkProductCode = productCode;
      this.selectedProductCode = productCode;
    },
    setProductCode(productCode: string) {
      this.selectedProductCode = productCode;
    },
    async loadEcsSpecs() {
      this.ecsSpecs = await getEcsSpecs(this.selectedSpecType);
      const first = this.ecsSpecs[0];
      if (first) {
        this.selectedSpecKey = `${first.vcpu}-${first.memory}-${first.spec_type}`;
      }
    },
    async loadOssOptions() {
      this.ossOptions = await getOssOptions();
      if (!this.storageSpec) {
        this.storageSpec = this.ossOptions.storage_specs[0] || "";
      }
      if (!this.streamSpec) {
        this.streamSpec = this.ossOptions.stream_specs[0] || "";
      }
    },
    async loadCurrentProductData() {
      this.quoteResult = null;

      if (this.selectedCategory === "compute" && this.selectedProductCode === "ecs") {
        await this.loadEcsSpecs();
        return;
      }

      if (this.selectedCategory === "storage" && this.selectedProductCode === "oss_storage") {
        await this.loadOssOptions();
        return;
      }

      this.ecsSpecs = [];
      this.selectedSpecKey = "";
    },
    setPeriodValue(value: number | string) {
      if (value === "custom") {
        this.periodMonths = 1;
        return;
      }
      this.periodMonths = Number(value);
      this.monthlySelection = "";
    },
    setCustomMonth(month: string) {
      this.monthlySelection = month;
      this.periodMonths = Number(month || 1);
    },
    updateQuantity(delta: number) {
      this.quantity = Math.max(1, this.quantity + delta);
    },
    updateStorageQuantity(delta: number) {
      this.storageQuantity = Math.max(1, this.storageQuantity + delta);
    },
    updateStreamQuantity(delta: number) {
      this.streamQuantity = Math.max(0, this.streamQuantity + delta);
    },
    updateSecurityProductQuantity(key: string, delta: number) {
      const item = this.securityProducts.find((product) => product.key === key);
      if (!item) {
        return;
      }
      item.quantity = Math.max(1, item.quantity + delta);
    },
    toggleSecurityProduct(key: string) {
      const item = this.securityProducts.find((product) => product.key === key);
      if (item) {
        item.expanded = !item.expanded;
      }
    },
    addCurrentQuoteToList() {
      if (!this.quoteResult) {
        return;
      }

      const configDetail =
        this.selectedCategory === "compute" && this.selectedSpec
          ? `${this.selectedSpec.spec_name}：${this.selectedSpec.vcpu}核${this.selectedSpec.memory}G`
          : this.selectedCategory === "network"
            ? `带宽：${this.bandwidth}M`
            : this.selectedCategory === "security"
              ? "安全产品组合配置"
              : `存储空间：${this.storageSpec || "未选"} x ${this.storageQuantity}${this.streamQuantity > 0 ? `；流量包：${this.streamSpec || "未选"} x ${this.streamQuantity}` : ""}`;

      this.configList.push({
        id: `${Date.now()}-${this.selectedProductCode}`,
        region: this.regionCode || "抚州",
        product_name: this.quoteResult.product_name || this.selectedProductCode,
        config_detail: configDetail,
        quantity: this.quantity,
        duration_text: this.durationText,
        catalog_price: this.quoteResult.sale_total_price,
        discount_price: this.quoteResult.min_total_price,
        year1_total: this.quoteResult.min_total_price,
        year2_total: this.quoteResult.min_total_price
      });
      this.currentTab = "config-list";
    },
    removeConfigItem(id: string) {
      this.configList = this.configList.filter((item) => item.id !== id);
    },
    async calculateCurrentQuote() {
      if (this.selectedCategory === "compute" && this.selectedProductCode === "ecs" && !this.selectedSpec) {
        throw new Error("请先选择 ECS 规格");
      }

      this.loading = true;
      try {
        if (this.selectedCategory === "compute" && this.selectedProductCode === "ecs" && this.selectedSpec) {
          this.quoteResult = await calculateQuote({
            product_code: "ecs",
            category_code: "compute",
            region_code: "jiangxi",
            billing_mode: "year_month",
            period_months: this.periodMonths,
            quantity: this.quantity,
            config: {
              spec_type: this.selectedSpec.spec_type,
              vcpu: this.selectedSpec.vcpu,
              memory: this.selectedSpec.memory
            }
          });
          return;
        }

        if (this.selectedCategory === "network" && this.selectedProductCode === "internet_bandwidth") {
          this.quoteResult = await calculateQuote({
            product_code: "internet_bandwidth",
            category_code: "network",
            region_code: "jiangxi",
            billing_mode: "year_month",
            period_months: this.periodMonths,
            quantity: this.quantity,
            config: {
              bandwidth: this.bandwidth
            }
          });
          return;
        }

        if (this.selectedCategory === "security") {
          this.quoteResult = {
            product_code: "cloud_security",
            category_code: "security",
            product_name: "云安全",
            sale_total_price: 1440,
            min_total_price: 1440,
            period_display: this.durationText,
            line_items: this.securityProducts.slice(0, 4).map((item) => ({
              label: item.label,
              amount: 360
            })),
            config_snapshot: {
              compliance_level: this.securityComplianceLevel
            }
          };
          return;
        }

        if (this.selectedCategory === "storage") {
          this.quoteResult = await calculateQuote({
            product_code: "oss_storage",
            category_code: "storage",
            region_code: "jiangxi",
            billing_mode: "year_month",
            period_months: this.periodMonths,
            quantity: 1,
            config: {
              storage_spec: this.storageSpec,
              storage_quantity: this.storageQuantity,
              stream_spec: this.streamSpec,
              stream_quantity: this.streamQuantity
            }
          });
          return;
        }

        throw new Error("当前所选产品尚未接入计算链路");
      } finally {
        this.loading = false;
      }
    }
  }
});
