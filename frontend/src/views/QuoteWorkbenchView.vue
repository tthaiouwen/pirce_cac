<template>
  <section class="quote-shell">
    <header class="hero-banner">
      <div class="hero-brand">
        <div class="brand-mark"></div>
        <div>
          <div class="brand-cn">中国联通</div>
          <div class="brand-en">China unicom</div>
        </div>
      </div>
      <div class="hero-copy">
        <h1>联通云产品价格计算器</h1>
        <p>产品清单自助选配，价格信息一键估算</p>
      </div>
      <div class="hero-visual">
        <div class="hero-cloud"></div>
        <div class="hero-node node-a"></div>
        <div class="hero-node node-b"></div>
        <div class="hero-node node-c"></div>
        <div class="hero-node node-d"></div>
      </div>
    </header>

    <section class="base-info-card">
      <div class="base-info-head">
        <div class="base-info-title">基础信息区域</div>
        <button class="ghost-button small-ghost" @click="store.openProjectModal()">创建新项目</button>
      </div>
      <div class="base-info-grid">
        <label class="form-pair">
          <span>项目名称</span>
          <input v-model="store.projectName" type="text" />
        </label>
        <label class="form-pair">
          <span>所属行业</span>
          <input :value="store.industry" type="text" readonly />
        </label>
        <label class="form-pair">
          <span>云池区域</span>
          <select v-model="store.regionCode">
            <option value="">请选择云池区域</option>
            <option value="南昌二区">南昌二区</option>
            <option value="抚州">抚州</option>
            <option value="赣州">赣州</option>
          </select>
        </label>
        <label class="form-pair">
          <span>计费类型</span>
          <input :value="store.billingTypeLabel" type="text" readonly />
        </label>
        <label class="form-pair">
          <span>产品类型</span>
          <select v-model="store.selectedCategory" @change="handleCategoryChange(store.selectedCategory)">
            <option v-for="item in store.categoryOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
        <label class="form-pair">
          <span>产品名称</span>
          <select v-model="store.selectedProductCode" @change="handleProductChange">
            <option
              v-for="item in store.productOptionsBySelectedCategory"
              :key="item.product_code"
              :value="item.product_code"
            >
              {{ item.display_name }}
            </option>
          </select>
        </label>
      </div>
    </section>

    <section v-if="store.showGuideCard" class="guide-card">
      <div class="guide-head">
        <div class="guide-icon"></div>
        <h2>请参考以下步骤开始配置您的云服务产品</h2>
        <p>您可以配置多个产品并加入清单，方便统一管理和价格比对</p>
      </div>
      <div class="guide-grid">
        <article v-for="(item, index) in store.guideSteps" :key="item.title" class="guide-step">
          <div class="guide-badge">{{ index + 1 }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="workspace-card">
      <div class="tab-strip">
        <button
          class="tab-pill"
          :class="{ active: store.currentTab === 'calculator' }"
          @click="store.setTab('calculator')"
        >
          价格计算
        </button>
        <button
          class="tab-pill"
          :class="{ active: store.currentTab === 'config-list' }"
          @click="store.setTab('config-list')"
        >
          配置清单
          <span v-if="store.configList.length" class="pill-count">{{ store.configList.length }}</span>
        </button>
        <button
          class="tab-pill"
          :class="{ active: store.currentTab === 'price-list' }"
          @click="store.setTab('price-list')"
        >
          价格列表
        </button>
      </div>

      <div v-if="store.currentTab === 'calculator'" class="tab-panel">
        <div class="calculator-intro">
          <div>
            <div class="calculator-kicker">当前配置</div>
            <h3>{{ currentCategoryLabel }} / {{ currentProductLabel }}</h3>
          </div>
          <div class="calculator-badges">
            <span class="summary-badge">云池区域：{{ store.regionCode || "待选择" }}</span>
            <span class="summary-badge">计费方式：{{ store.billingTypeLabel }}</span>
          </div>
        </div>

        <div v-if="store.selectedCategory === 'compute'" class="section-stack">
          <section class="config-section">
            <div class="section-heading">
              <div>
                <h3>实例规格</h3>
                <p>按架构、规格族和实例资源选择服务器配置</p>
              </div>
            </div>
            <div class="chip-row">
              <span class="field-label">架构</span>
              <button class="chip active">x86计算</button>
            </div>
            <div class="chip-row">
              <span class="field-label">规格</span>
              <button
                v-for="item in store.computeFlavorTabs"
                :key="item.value"
                class="chip"
                :class="{ active: store.selectedSpecType === item.value }"
                @click="selectComputeFlavor(item.value)"
              >
                {{ item.label }}
              </button>
            </div>
            <table class="spec-table">
              <thead>
                <tr>
                  <th></th>
                  <th>vCPU（核）</th>
                  <th>内存（GB）</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in store.ecsSpecs.slice(0, 6)"
                  :key="`${item.vcpu}-${item.memory}-${item.spec_type}`"
                  :class="{ selected: store.selectedSpecKey === `${item.vcpu}-${item.memory}-${item.spec_type}` }"
                >
                  <td>
                    <input
                      :checked="store.selectedSpecKey === `${item.vcpu}-${item.memory}-${item.spec_type}`"
                      type="radio"
                      @change="store.selectedSpecKey = `${item.vcpu}-${item.memory}-${item.spec_type}`"
                    />
                  </td>
                  <td>{{ item.vcpu }}</td>
                  <td>{{ item.memory }}</td>
                </tr>
              </tbody>
            </table>

            <div class="summary-card-grid">
              <article class="summary-card">
                <span>已选规格</span>
                <strong>{{ selectedSpecSummary }}</strong>
              </article>
              <article class="summary-card">
                <span>实例架构</span>
                <strong>x86计算 / {{ selectedFlavorLabel }}</strong>
              </article>
              <article class="summary-card">
                <span>当前数量</span>
                <strong>{{ store.quantity }} 台</strong>
              </article>
            </div>
          </section>

          <section class="config-section">
            <div class="inline-disk-row">
              <span class="field-label strong">系统盘</span>
              <select v-model="store.systemDiskType">
                <option value="">请选择产品类型</option>
                <option value="高效云硬盘">高效云硬盘</option>
                <option value="SSD云硬盘">SSD云硬盘</option>
              </select>
              <select v-model="store.systemDiskSize">
                <option value="">请选择容量</option>
                <option value="50">50G</option>
                <option value="100">100G</option>
                <option value="200">200G</option>
              </select>
              <span class="tip-red">免费赠送50G</span>
            </div>

            <div class="data-disk-head">
              <span class="field-label strong">数据盘</span>
              <button class="link-chip">+ 添加数据盘（2/8）</button>
            </div>

            <div v-for="item in store.dataDiskItems" :key="item.id" class="data-disk-row">
              <button class="icon-button">−</button>
              <select v-model="item.diskType">
                <option value="">请选择产品类型</option>
                <option value="高效云硬盘">高效云硬盘</option>
                <option value="高效增强型">高效增强型</option>
              </select>
              <select v-model="item.diskSize">
                <option value="">请选择容量</option>
                <option value="100">100G</option>
                <option value="200">200G</option>
                <option value="500">500G</option>
              </select>
              <div class="counter-inline">
                <span>数量</span>
                <button class="icon-button">−</button>
                <strong>{{ item.quantity }}</strong>
                <button class="icon-button">+</button>
              </div>
            </div>

            <div class="inline-note-grid">
              <div class="note-pill">系统盘：{{ store.systemDiskType || "未选择" }} {{ store.systemDiskSize ? `${store.systemDiskSize}G` : "" }}</div>
              <div class="note-pill">数据盘条目：{{ activeDataDiskCount }} 组</div>
            </div>
          </section>

          <section class="config-section">
            <div class="duration-row">
              <span class="field-label strong">购买时长</span>
              <div class="duration-chips">
                <button
                  v-for="item in store.durationOptions"
                  :key="String(item.value)"
                  class="duration-chip"
                  :class="{ active: item.value !== 'custom' && store.periodMonths === item.value }"
                  @click="store.setPeriodValue(item.value)"
                >
                  {{ item.label }}
                </button>
                <select class="month-select" :value="store.monthlySelection" @change="handleCustomMonth">
                  <option value="">请选择数量</option>
                  <option v-for="month in 11" :key="month" :value="month">{{ month }}</option>
                </select>
                <span class="unit-text">月</span>
              </div>
            </div>

            <div class="duration-row">
              <span class="field-label strong">购买数量</span>
              <div class="counter-inline large">
                <button class="icon-button" @click="store.updateQuantity(-1)">−</button>
                <strong>{{ store.quantity }}</strong>
                <button class="icon-button" @click="store.updateQuantity(1)">+</button>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="store.selectedCategory === 'network'" class="section-stack">
          <section class="config-section compact">
            <div class="section-heading">
              <div>
                <h3>规格配置</h3>
                <p>网络类产品以规格、带宽与数量为核心参数</p>
              </div>
            </div>
            <div class="single-row-form">
              <label class="inline-field">
                <span>规格</span>
                <select v-model="store.selectedNetworkProductCode" @change="handleNetworkProductChange">
                  <option value="internet_bandwidth">互联网带宽</option>
                  <option value="shared_bandwidth">共享带宽</option>
                  <option value="slb">负载均衡SLB</option>
                  <option value="nat_gateway">NAT网关</option>
                </select>
              </label>
              <label v-if="store.selectedNetworkProductCode === 'internet_bandwidth'" class="inline-field">
                <span>带宽</span>
                <input v-model.number="store.bandwidth" type="number" min="1" />
              </label>
              <label v-if="store.selectedNetworkProductCode === 'slb'" class="inline-field">
                <span>规格</span>
                <select>
                  <option>共享型</option>
                  <option>独享型网络型</option>
                </select>
              </label>
              <label v-if="store.selectedNetworkProductCode === 'nat_gateway'" class="inline-field">
                <span>网关规格</span>
                <select>
                  <option>小型</option>
                  <option>中型</option>
                  <option>大型</option>
                </select>
              </label>
              <div class="counter-inline large">
                <span>数量</span>
                <button class="icon-button" @click="store.updateQuantity(-1)">−</button>
                <strong>{{ store.quantity }}</strong>
                <button class="icon-button" @click="store.updateQuantity(1)">+</button>
              </div>
            </div>

            <div class="summary-card-grid network">
              <article class="summary-card accent">
                <span>当前产品</span>
                <strong>{{ currentProductLabel }}</strong>
              </article>
              <article class="summary-card">
                <span>核心参数</span>
                <strong>{{ networkSummaryText }}</strong>
              </article>
              <article class="summary-card">
                <span>适用场景</span>
                <strong>{{ networkScenarioText }}</strong>
              </article>
            </div>
          </section>

          <section class="config-section compact">
            <div class="duration-row">
              <span class="field-label strong">购买时长</span>
              <div class="duration-chips">
                <button
                  v-for="item in store.durationOptions"
                  :key="`network-${String(item.value)}`"
                  class="duration-chip"
                  :class="{ active: item.value !== 'custom' && store.periodMonths === item.value }"
                  @click="store.setPeriodValue(item.value)"
                >
                  {{ item.label }}
                </button>
                <select class="month-select" :value="store.monthlySelection" @change="handleCustomMonth">
                  <option value="">请选择数量</option>
                  <option v-for="month in 11" :key="`network-${month}`" :value="month">{{ month }}</option>
                </select>
                <span class="unit-text">月</span>
              </div>
            </div>
          </section>

          <section class="config-section compact">
            <div class="section-heading">
              <div>
                <h3>产品说明</h3>
                <p>当前网络产品的典型能力和使用建议</p>
              </div>
            </div>
            <div class="feature-grid">
              <article v-for="feature in networkFeatureList" :key="feature.title" class="feature-card">
                <h4>{{ feature.title }}</h4>
                <p>{{ feature.desc }}</p>
              </article>
            </div>
          </section>
        </div>

        <div v-else-if="store.selectedCategory === 'security'" class="section-stack">
          <section class="config-section compact">
            <div class="section-heading">
              <div>
                <h3>等保要求</h3>
                <p>按等保套餐或自定义方式组合安全产品，保持后续可扩展</p>
              </div>
            </div>
            <div class="chip-row">
              <button
                class="chip"
                :class="{ active: store.securityComplianceLevel === 'level2' }"
                @click="store.securityComplianceLevel = 'level2'"
              >
                等保二级
              </button>
              <button
                class="chip"
                :class="{ active: store.securityComplianceLevel === 'level3' }"
                @click="store.securityComplianceLevel = 'level3'"
              >
                等保三级
              </button>
              <button
                class="chip"
                :class="{ active: store.securityComplianceLevel === 'custom' }"
                @click="store.securityComplianceLevel = 'custom'"
              >
                自定义
              </button>
            </div>
          </section>

          <section class="security-note">
            <p>1、产品默认折叠状态，点击按钮可展开选择配置明细</p>
            <p>2、选择等保套餐，默认勾选对应产品名称和规格，产品不可删减，规格类型可调整，数量可调整</p>
            <p>3、以下为等保三级套餐包含产品展开状态</p>
          </section>

          <section v-for="product in store.securityProducts" :key="product.key" class="security-card">
            <div class="security-card-head" @click="store.toggleSecurityProduct(product.key)">
              <label class="security-check">
                <input checked type="checkbox" />
                <span>{{ product.label }}</span>
              </label>
              <span class="expand-icon">{{ product.expanded ? "▴" : "▾" }}</span>
            </div>
            <div v-if="product.expanded" class="security-body-stack">
              <div class="security-card-body">
                <select>
                  <option>通用型</option>
                  <option>原生型</option>
                </select>
                <select>
                  <option>标准版</option>
                  <option>增强版</option>
                </select>
                <div class="counter-inline">
                  <span>{{ product.quantityLabel }}</span>
                  <button class="icon-button" @click="store.updateSecurityProductQuantity(product.key, -1)">−</button>
                  <strong>{{ product.quantity }}</strong>
                  <button class="icon-button" @click="store.updateSecurityProductQuantity(product.key, 1)">+</button>
                </div>
                <span class="tip-red">{{ product.hint }}</span>
              </div>

              <ol v-if="hasSecurityBulletNotes(product.key)" class="security-detail-list">
                <li v-for="note in getSecurityBulletNotes(product.key)" :key="note">{{ note }}</li>
              </ol>

              <div v-if="showWafExtensions(product.key)" class="waf-extension-stack">
                <div class="extension-row">
                  <label class="extension-option">
                    <input checked type="radio" name="waf-extension-ip" />
                    <span>扩展IP</span>
                  </label>
                  <div class="counter-inline">
                    <span>数量</span>
                    <button class="icon-button">−</button>
                    <strong>1</strong>
                    <button class="icon-button">+</button>
                  </div>
                  <span class="tip-red">最高支持20个IP</span>
                </div>
                <div class="extension-row">
                  <label class="extension-option">
                    <input checked type="radio" name="waf-extension-port" />
                    <span>扩展端口</span>
                  </label>
                  <div class="counter-inline">
                    <span>数量</span>
                    <button class="icon-button">−</button>
                    <strong>1</strong>
                    <button class="icon-button">+</button>
                  </div>
                  <span class="tip-red">最高支持20个端口</span>
                </div>
              </div>
            </div>
          </section>

          <section class="config-section compact">
            <div class="duration-row">
              <span class="field-label strong">购买时长</span>
              <div class="duration-chips">
                <button
                  v-for="item in store.durationOptions"
                  :key="`security-${String(item.value)}`"
                  class="duration-chip"
                  :class="{ active: item.value !== 'custom' && store.periodMonths === item.value }"
                  @click="store.setPeriodValue(item.value)"
                >
                  {{ item.label }}
                </button>
                <select class="month-select" :value="store.monthlySelection" @change="handleCustomMonth">
                  <option value="">请选择数量</option>
                  <option v-for="month in 11" :key="`security-${month}`" :value="month">{{ month }}</option>
                </select>
                <span class="unit-text">月</span>
              </div>
            </div>
          </section>
        </div>

        <div v-else class="section-stack">
          <section class="config-section compact">
            <div class="section-heading">
              <div>
                <h3>规格配置</h3>
                <p>当前已接入对象存储 OSS 的容量包与外网下行流量包报价。</p>
              </div>
            </div>

            <div class="storage-form-grid">
              <article class="storage-config-card">
                <div class="storage-config-head">
                  <h4>存储空间（容量包）</h4>
                  <span class="summary-badge">必选</span>
                </div>
                <div class="storage-config-body">
                  <label class="inline-field">
                    <span>规格</span>
                    <select v-model="store.storageSpec">
                      <option v-for="item in store.ossOptions.storage_specs" :key="item" :value="item">
                        {{ item }}
                      </option>
                    </select>
                  </label>
                  <div class="counter-inline large">
                    <span>数量</span>
                    <button class="icon-button" @click="store.updateStorageQuantity(-1)">−</button>
                    <strong>{{ store.storageQuantity }}</strong>
                    <button class="icon-button" @click="store.updateStorageQuantity(1)">+</button>
                  </div>
                </div>
              </article>

              <article class="storage-config-card">
                <div class="storage-config-head">
                  <h4>外网下行流量包</h4>
                  <span class="summary-badge">可选</span>
                </div>
                <div class="storage-config-body">
                  <label class="inline-field">
                    <span>规格</span>
                    <select v-model="store.streamSpec">
                      <option v-for="item in store.ossOptions.stream_specs" :key="item" :value="item">
                        {{ item }}
                      </option>
                    </select>
                  </label>
                  <div class="counter-inline large">
                    <span>数量</span>
                    <button class="icon-button" @click="store.updateStreamQuantity(-1)">−</button>
                    <strong>{{ store.streamQuantity }}</strong>
                    <button class="icon-button" @click="store.updateStreamQuantity(1)">+</button>
                  </div>
                </div>
              </article>
            </div>

            <div class="summary-card-grid">
              <article class="summary-card accent">
                <span>容量包</span>
                <strong>{{ storageSummaryText }}</strong>
              </article>
              <article class="summary-card">
                <span>流量包</span>
                <strong>{{ streamSummaryText }}</strong>
              </article>
              <article class="summary-card">
                <span>当前周期</span>
                <strong>{{ store.durationText }}</strong>
              </article>
            </div>
          </section>

          <section class="config-section compact">
            <div class="section-heading">
              <div>
                <h3>购买时长</h3>
                <p>支持按月与按年报价，周期与旧价格表保持一致。</p>
              </div>
            </div>
            <div class="duration-row">
              <span class="field-label strong">购买时长</span>
              <div class="duration-chips">
                <button
                  v-for="item in store.durationOptions"
                  :key="`storage-${String(item.value)}`"
                  class="duration-chip"
                  :class="{ active: item.value !== 'custom' && store.periodMonths === item.value }"
                  @click="store.setPeriodValue(item.value)"
                >
                  {{ item.label }}
                </button>
                <select class="month-select" :value="store.monthlySelection" @change="handleCustomMonth">
                  <option value="">请选择数量</option>
                  <option v-for="month in 11" :key="`storage-${month}`" :value="month">{{ month }}</option>
                </select>
                <span class="unit-text">月</span>
              </div>
            </div>
          </section>
        </div>

        <footer class="price-footer">
          <div class="price-text-group stacked">
            <div class="price-caption">销售指导价</div>
            <div class="price-main-row">
              <div class="price-value">¥ {{ (store.quoteResult?.sale_total_price || 1440).toFixed(2) }}</div>
              <div class="price-meta">
                <div class="price-subcaption">最低限价请查看清单</div>
                <div class="price-subcaption">当前周期：{{ store.durationText }}</div>
              </div>
            </div>
          </div>
          <div class="price-actions">
            <button class="ghost-button soft-ghost" @click="store.setTab('price-list')">查看价格列表</button>
            <button class="cta-button" :disabled="store.loading" @click="handleCalculate">
              {{ store.loading ? "计算中..." : "加入清单" }}
            </button>
          </div>
        </footer>

        <section v-if="quoteLineItems.length" class="config-section quote-breakdown-card">
          <div class="section-heading">
            <div>
              <h3>报价明细</h3>
              <p>按当前配置展示的价格拆分，后续可继续接入更完整的后端明细</p>
            </div>
          </div>
          <div class="breakdown-list">
            <div v-for="item in quoteLineItems" :key="item.label" class="breakdown-item">
              <span>{{ item.label }}</span>
              <strong>¥ {{ Number(item.amount).toFixed(2) }}</strong>
            </div>
          </div>
        </section>
      </div>

      <div v-else-if="store.currentTab === 'config-list'" class="tab-panel">
        <div class="table-page-head">
          <div>
            <div class="calculator-kicker">配置清单</div>
            <h3 class="panel-title">已选产品清单</h3>
            <p class="table-page-desc">统一查看当前项目下的产品组合、价格汇总和周期总价。</p>
          </div>
          <div class="table-page-badges">
            <span class="summary-badge">产品数：{{ store.configList.length }}</span>
            <span class="summary-badge">折扣总价：¥ {{ store.configListSummary.discountTotal.toFixed(2) }}</span>
          </div>
        </div>

        <div class="summary-card-grid table-summary-grid">
          <article class="summary-card accent">
            <span>折扣总价</span>
            <strong>¥ {{ store.configListSummary.discountTotal.toFixed(2) }}</strong>
          </article>
          <article class="summary-card">
            <span>1年总价</span>
            <strong>¥ {{ store.configListSummary.year1Total.toFixed(2) }}</strong>
          </article>
          <article class="summary-card">
            <span>2年总价</span>
            <strong>¥ {{ store.configListSummary.year2Total.toFixed(2) }}</strong>
          </article>
        </div>

        <div class="table-shell">
          <table class="config-table">
            <thead>
              <tr>
                <th>云池区域</th>
                <th>产品名称</th>
                <th>配置详情</th>
                <th>数量</th>
                <th>购买时长</th>
                <th>目录价（元）</th>
                <th>折扣价（元）</th>
                <th>1年总价（元）</th>
                <th>2年总价（元）</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in store.configList" :key="item.id">
                <td>{{ item.region }}</td>
                <td>{{ item.product_name }}</td>
                <td class="align-left">{{ item.config_detail }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.duration_text }}</td>
                <td>{{ item.catalog_price.toFixed(2) }}</td>
                <td>{{ item.discount_price.toFixed(2) }}</td>
                <td>{{ item.year1_total.toFixed(2) }}</td>
                <td>{{ item.year2_total.toFixed(2) }}</td>
                <td>
                  <div class="table-action-group">
                    <button class="table-link">修改</button>
                    <button class="table-link" @click="store.removeConfigItem(item.id)">删除</button>
                  </div>
                </td>
              </tr>
              <tr v-if="store.configList.length" class="summary-row">
                <td colspan="6"></td>
                <td>¥ {{ store.configListSummary.discountTotal.toFixed(2) }}</td>
                <td>¥ {{ store.configListSummary.year1Total.toFixed(2) }}</td>
                <td>¥ {{ store.configListSummary.year2Total.toFixed(2) }}</td>
                <td></td>
              </tr>
              <tr v-if="!store.configList.length">
                <td colspan="10" class="empty-cell">
                  <div class="table-empty-state">
                    <strong>暂无配置清单</strong>
                    <span>请先返回“价格计算”页添加产品，清单会在这里统一汇总。</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="list-footer">
          <button class="cta-button secondary">导出清单</button>
        </div>
      </div>

      <div v-else class="tab-panel">
        <div class="table-page-head">
          <div>
            <div class="calculator-kicker">价格列表</div>
            <h3 class="panel-title">产品价格信息</h3>
            <p class="table-page-desc">查看同一产品在不同规格、周期下的目录价和最低折扣价。</p>
          </div>
          <div class="table-page-badges">
            <span class="summary-badge">当前类型：{{ currentCategoryLabel }}</span>
            <span class="summary-badge">当前产品：{{ currentProductLabel }}</span>
          </div>
        </div>

        <div class="price-filter-shell">
          <div class="price-list-filters">
            <label class="inline-field">
              <span>产品类型</span>
              <select v-model="store.selectedCategory" @change="handleCategoryChange(store.selectedCategory)">
                <option v-for="item in store.categoryOptions" :key="`price-${item.value}`" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </label>
            <label class="inline-field">
              <span>产品名称</span>
              <select v-model="store.selectedProductCode" @change="handleProductChange">
                <option
                  v-for="item in store.productOptionsBySelectedCategory"
                  :key="`price-${item.product_code}`"
                  :value="item.product_code"
                >
                  {{ item.display_name }}
                </option>
              </select>
            </label>
          </div>

          <div class="price-filter-tip">
            <strong>筛选说明</strong>
            <span>当前价格表优先展示已接入产品，未接入产品先保留结构和占位数据。</span>
          </div>
        </div>

        <div class="table-shell">
          <table class="price-table">
            <thead>
              <tr>
                <th rowspan="2">类别</th>
                <th rowspan="2">名称</th>
                <th rowspan="2">规格1</th>
                <th rowspan="2">vCPU（核）</th>
                <th rowspan="2">内存（G）</th>
                <th colspan="4">销售价-月单价（元/月）</th>
                <th colspan="4">最低折扣价-月单价（元/月）</th>
              </tr>
              <tr>
                <th>包月</th>
                <th>1年</th>
                <th>2年</th>
                <th>3年</th>
                <th>包月</th>
                <th>1年</th>
                <th>2年</th>
                <th>3年</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in store.priceListRows" :key="`price-row-${index}`">
                <td>{{ row.category }}</td>
                <td>{{ row.product_name }}</td>
                <td>{{ row.spec_name }}</td>
                <td>{{ row.vcpu }}</td>
                <td>{{ row.memory }}</td>
                <td>{{ row.package_price }}</td>
                <td>{{ row.price_1y }}</td>
                <td>{{ row.price_2y }}</td>
                <td>{{ row.price_3y }}</td>
                <td>{{ row.min_package_price }}</td>
                <td>{{ row.min_1y }}</td>
                <td>{{ row.min_2y }}</td>
                <td>{{ row.min_3y }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div v-if="store.showProjectModal" class="modal-mask" @click.self="store.closeProjectModal()">
      <div class="project-modal">
        <h2>创建新项目</h2>
        <div class="modal-grid">
          <label class="modal-field">
            <span><i>*</i>项目名称：</span>
            <input v-model="store.projectName" type="text" placeholder="请输入项目名称" />
          </label>
          <label class="modal-field">
            <span><i>*</i>所属行业：</span>
            <select v-model="store.industry">
              <option value="">请选择项目所属行业</option>
              <option value="教育">教育</option>
              <option value="医疗">医疗</option>
              <option value="政务">政务</option>
            </select>
          </label>
          <label class="modal-field">
            <span><i>*</i>所在城市：</span>
            <select v-model="store.projectCity">
              <option value="">请选择所在城市</option>
              <option value="南昌">南昌</option>
              <option value="抚州">抚州</option>
              <option value="赣州">赣州</option>
            </select>
          </label>
        </div>
        <div class="modal-actions">
          <button class="ghost-button" @click="store.resetProjectForm()">重置</button>
          <button class="cta-button small" @click="store.closeProjectModal()">确定</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useQuoteWorkbenchStore } from "@/stores/useQuoteWorkbenchStore";

const store = useQuoteWorkbenchStore();

const securityDetailMap: Record<string, string[]> = {
  cloud_firewall: [
    "网络吞吐支持：1Gbps，并发连接数支持：500000，每秒新建连接数：15000；",
    "IPS 吞吐支持：500Mbps，最大并发连接数：500000，最大新建连接数：15000；",
    "SSL VPN 吞吐支持：500Mbps，最大并发数：100个。"
  ]
};

const networkFeatureMap: Record<string, Array<{ title: string; desc: string }>> = {
  internet_bandwidth: [
    { title: "弹性接入", desc: "适合公网访问、业务上线初期和带宽按需调整场景。" },
    { title: "快速估算", desc: "当前已接入真实报价接口，可直接验证带宽与周期价格。" },
    { title: "统一管理", desc: "可与计算类、安全类产品一起加入清单，便于整体比价。" }
  ],
  shared_bandwidth: [
    { title: "共享出口", desc: "适合多实例共用带宽池，后续会补齐实例关联能力。" },
    { title: "成本优化", desc: "峰谷流量不均的业务更容易发挥共享带宽的成本优势。" },
    { title: "扩展预留", desc: "当前以前端设计壳承接，后续直接接入真实计算规则。" }
  ],
  slb: [
    { title: "高可用入口", desc: "适合多可用区部署和应用层流量分发。" },
    { title: "规格分层", desc: "后续将补充共享型、独享型、协议与实例规格差异。" },
    { title: "与ECS联动", desc: "可作为计算类产品的标准搭配项加入组合清单。" }
  ],
  nat_gateway: [
    { title: "统一出网", desc: "适合私网资源集中访问公网的出口治理场景。" },
    { title: "安全隔离", desc: "便于和防火墙、WAF、安全审计一起做边界防护。" },
    { title: "规则待接入", desc: "当前已预留规格位，后续可直接接真实网关计价。" }
  ]
};

onMounted(async () => {
  await store.initialize();
});

const currentCategoryLabel = computed(() => {
  return store.categoryOptions.find((item) => item.value === store.selectedCategory)?.label || "未选择";
});

const currentProductLabel = computed(() => {
  return (
    store.productOptionsBySelectedCategory.find((item) => item.product_code === store.selectedProductCode)
      ?.display_name || "未选择产品"
  );
});

const selectedFlavorLabel = computed(() => {
  return store.computeFlavorTabs.find((item) => item.value === store.selectedSpecType)?.label || "通用型";
});

const selectedSpecSummary = computed(() => {
  if (!store.selectedSpec) {
    return "请选择实例规格";
  }
  return `${store.selectedSpec.vcpu}核 ${store.selectedSpec.memory}G`;
});

const activeDataDiskCount = computed(() => {
  return store.dataDiskItems.filter((item) => item.diskType || item.diskSize).length;
});

const storageSummaryText = computed(() => {
  return `${store.storageSpec || "未选择"} x ${store.storageQuantity}`;
});

const streamSummaryText = computed(() => {
  if (store.streamQuantity <= 0) {
    return "未添加流量包";
  }
  return `${store.streamSpec || "未选择"} x ${store.streamQuantity}`;
});

const networkSummaryText = computed(() => {
  if (store.selectedNetworkProductCode === "internet_bandwidth") {
    return `${store.bandwidth}M 带宽 / ${store.quantity} 个资源`;
  }
  if (store.selectedNetworkProductCode === "slb") {
    return `${store.quantity} 个实例 / 负载均衡入口`;
  }
  if (store.selectedNetworkProductCode === "nat_gateway") {
    return `${store.quantity} 个网关 / 集中出网`;
  }
  return `${store.quantity} 个共享带宽资源`;
});

const networkScenarioText = computed(() => {
  if (store.selectedNetworkProductCode === "internet_bandwidth") {
    return "公网访问与业务快速上线";
  }
  if (store.selectedNetworkProductCode === "slb") {
    return "业务流量分发与高可用入口";
  }
  if (store.selectedNetworkProductCode === "nat_gateway") {
    return "私网统一出网与边界治理";
  }
  return "多实例共享出口带宽";
});

const networkFeatureList = computed(() => {
  return networkFeatureMap[store.selectedNetworkProductCode] || [];
});

const quoteLineItems = computed(() => {
  if (store.quoteResult?.line_items?.length) {
    return store.quoteResult.line_items;
  }

  if (store.selectedCategory === "compute" && store.selectedSpec) {
    return [
      { label: `ECS ${selectedSpecSummary.value}`, amount: store.quoteResult?.sale_total_price || 1440 },
      { label: "系统盘与附属配置", amount: 0 }
    ];
  }

  if (store.selectedCategory === "network") {
    return [{ label: currentProductLabel.value, amount: store.quoteResult?.sale_total_price || 1440 }];
  }

  if (store.selectedCategory === "security") {
    return store.securityProducts.slice(0, 4).map((item) => ({
      label: item.label,
      amount: 360
    }));
  }

  if (store.selectedCategory === "storage") {
    return [
      {
        label: `存储容量包 ${store.storageSpec || "-" } x ${store.storageQuantity}`,
        amount: store.quoteResult?.line_items?.[0]?.amount || 0
      },
      ...(store.streamQuantity > 0
        ? [
            {
              label: `外网下行流量包 ${store.streamSpec || "-" } x ${store.streamQuantity}`,
              amount: store.quoteResult?.line_items?.[1]?.amount || 0
            }
          ]
        : [])
    ];
  }

  return [];
});

async function handleCategoryChange(category: "compute" | "network" | "storage" | "security") {
  store.setCategory(category);
  await store.loadCurrentProductData();
}

async function handleProductChange() {
  if (store.selectedCategory === "network") {
    store.setNetworkProduct(
      store.selectedProductCode as "internet_bandwidth" | "shared_bandwidth" | "slb" | "nat_gateway"
    );
  }
  await store.loadCurrentProductData();
}

async function handleNetworkProductChange() {
  store.setNetworkProduct(store.selectedNetworkProductCode);
  await store.loadCurrentProductData();
}

async function selectComputeFlavor(flavor: "general" | "compute" | "network" | "storage") {
  store.selectedSpecType = flavor;
  await store.loadEcsSpecs();
}

function hasSecurityBulletNotes(productKey: string) {
  return Boolean(securityDetailMap[productKey]?.length);
}

function getSecurityBulletNotes(productKey: string) {
  return securityDetailMap[productKey] || [];
}

function showWafExtensions(productKey: string) {
  return productKey === "web_app_firewall";
}

function handleCustomMonth(event: Event) {
  const target = event.target as HTMLSelectElement;
  store.setCustomMonth(target.value);
}

async function handleCalculate() {
  await store.calculateCurrentQuote();
  store.addCurrentQuoteToList();
}
</script>
