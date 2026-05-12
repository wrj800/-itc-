<template>
  <main class="ops-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">ICT</span>
        <div>
          <strong>智能运维</strong>
          <small>实验环境</small>
        </div>
      </div>

      <nav class="nav-list">
        <button
          v-for="item in navItems"
          :key="item.key"
          :class="{ active: activeView === item.key }"
          type="button"
          @click="activeView = item.key"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">ICT OPERATIONS CENTER</p>
          <h1>{{ currentTitle }}</h1>
        </div>
        <div class="toolbar">
          <el-tag :type="backendStatus === 'UP' ? 'success' : 'danger'" effect="dark">
            后端 {{ backendStatus }}
          </el-tag>
          <el-button :icon="Refresh" type="primary" :loading="loading" @click="refreshAll">
            刷新
          </el-button>
        </div>
      </header>

      <section v-if="activeView === 'overview'" class="view-stack">
        <div class="metric-grid">
          <article class="metric-card">
            <span>设备资产</span>
            <strong>{{ overview.totalAssets }}</strong>
            <small>在线 {{ overview.onlineAssets }} 台</small>
          </article>
          <article class="metric-card">
            <span>采集可用率</span>
            <strong>{{ overview.targetAvailability }}%</strong>
            <small>Prometheus / Blackbox / node_exporter</small>
          </article>
          <article class="metric-card">
            <span>活跃告警</span>
            <strong>{{ overview.activeAlerts }}</strong>
            <small>需跟进的异常事件</small>
          </article>
          <article class="metric-card">
            <span>未关闭工单</span>
            <strong>{{ overview.openWorkOrders }}</strong>
            <small>运维处理闭环</small>
          </article>
        </div>

        <div class="two-column">
          <article class="panel">
            <div class="panel-title">
              <div>
                <p class="eyebrow">TOPOLOGY</p>
                <h2>当前实验链路</h2>
              </div>
            </div>
            <div class="topology">
              <div class="topology-node">Vue 3 前端</div>
              <span></span>
              <div class="topology-node">Spring Boot API</div>
              <span></span>
              <div class="topology-node">Prometheus</div>
              <span></span>
              <div class="topology-node">WSL Linux 节点</div>
            </div>
            <ul class="timeline">
              <li v-for="target in monitorTargets.slice(0, 4)" :key="target.id">
                <i :class="target.status.toLowerCase()"></i>
                <div>
                  <strong>{{ target.name }}</strong>
                  <span>{{ target.endpoint }}</span>
                </div>
                <em>{{ target.latencyMs }}ms</em>
              </li>
            </ul>
          </article>

          <article class="panel">
            <div class="panel-title">
              <div>
                <p class="eyebrow">REAL NODE</p>
                <h2>真实 Linux 采集状态</h2>
              </div>
              <el-tag :type="wslNodeStatus === 'UP' ? 'success' : 'warning'">{{ wslNodeStatus }}</el-tag>
            </div>
            <dl class="node-info">
              <div>
                <dt>主机名</dt>
                <dd>{{ wslNode?.nodename ?? '-' }}</dd>
              </div>
              <div>
                <dt>系统</dt>
                <dd>{{ wslNode?.sysname ?? '-' }} {{ wslNode?.machine ?? '' }}</dd>
              </div>
              <div>
                <dt>内核</dt>
                <dd>{{ wslNode?.release ?? '-' }}</dd>
              </div>
              <div>
                <dt>数据源</dt>
                <dd>Prometheus / node_exporter</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section v-if="activeView === 'assets'" class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">ASSET</p>
            <h2>设备资产台账</h2>
          </div>
          <el-input v-model="assetKeyword" clearable placeholder="搜索名称、地址或采集器" />
        </div>
        <el-table :data="filteredAssets" stripe>
          <el-table-column prop="name" label="设备名称" min-width="180" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="model" label="型号/平台" min-width="160" />
          <el-table-column prop="address" label="地址" min-width="150" />
          <el-table-column prop="location" label="位置" min-width="130" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTag(row.status)">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="collector" label="采集方式" min-width="140" />
        </el-table>
      </section>

      <section v-if="activeView === 'monitor'" class="view-stack">
        <div class="two-column">
          <article class="panel">
            <div class="panel-title">
              <div>
                <p class="eyebrow">TARGETS</p>
                <h2>监控目标</h2>
              </div>
            </div>
            <ul class="target-list">
              <li v-for="target in monitorTargets" :key="target.id">
                <div>
                  <strong>{{ target.name }}</strong>
                  <span>{{ target.endpoint }}</span>
                </div>
                <el-tag :type="target.status === 'UP' ? 'success' : 'danger'">{{ target.status }}</el-tag>
              </li>
            </ul>
          </article>

          <article class="panel">
            <div class="panel-title">
              <div>
                <p class="eyebrow">PROMQL</p>
                <h2>实时查询</h2>
              </div>
            </div>
            <div class="query-box">
              <el-select v-model="promSource">
                <el-option label="Docker 观测栈" value="docker" />
                <el-option label="WSL 真实节点" value="wsl" />
              </el-select>
              <el-input v-model="promQuery" placeholder="输入 PromQL，例如 up" />
              <el-button type="primary" @click="runPromQuery">查询</el-button>
            </div>
            <pre class="raw">{{ latestRaw }}</pre>
          </article>
        </div>
      </section>

      <section v-if="activeView === 'alerts'" class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">ALERT</p>
            <h2>告警中心</h2>
          </div>
        </div>
        <el-table :data="alerts" stripe>
          <el-table-column prop="severity" label="级别" width="90">
            <template #default="{ row }">
              <el-tag :type="severityTag(row.severity)">{{ row.severity }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="告警标题" min-width="190" />
          <el-table-column prop="assetId" label="对象" width="130" />
          <el-table-column prop="metric" label="指标" min-width="140" />
          <el-table-column prop="summary" label="摘要" min-width="260" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" type="primary" plain @click="createTicket(row)">转工单</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-if="activeView === 'tickets'" class="kanban">
        <article v-for="column in ticketColumns" :key="column.key" class="kanban-column">
          <h2>{{ column.label }}</h2>
          <div v-for="order in ordersByStatus(column.key)" :key="order.id" class="ticket-card">
            <strong>{{ order.title }}</strong>
            <span>{{ order.id }} / {{ order.assignee }}</span>
            <p>{{ order.description }}</p>
          </div>
        </article>
      </section>

      <section v-if="activeView === 'ai'" class="two-column">
        <article class="panel">
          <div class="panel-title">
            <div>
              <p class="eyebrow">AI DIAGNOSIS</p>
              <h2>故障诊断助手</h2>
            </div>
          </div>
          <el-input
            v-model="diagnoseQuestion"
            :autosize="{ minRows: 7, maxRows: 10 }"
            type="textarea"
            placeholder="输入告警、指标或故障现象，例如：Blackbox 链路探测失败，WSL node_exporter Down"
          />
          <div class="form-actions">
            <el-button type="primary" :loading="diagnosing" @click="runDiagnosis">生成诊断</el-button>
          </div>
        </article>

        <article class="panel diagnosis">
          <div class="panel-title">
            <div>
              <p class="eyebrow">RESULT</p>
              <h2>处置建议</h2>
            </div>
            <el-tag v-if="diagnosis?.severity" type="warning">{{ diagnosis.severity }}</el-tag>
          </div>
          <template v-if="diagnosis">
            <h3>可能原因</h3>
            <ul>
              <li v-for="item in diagnosis.possibleCauses" :key="item">{{ item }}</li>
            </ul>
            <h3>建议动作</h3>
            <ul>
              <li v-for="item in diagnosis.recommendedActions" :key="item">{{ item }}</li>
            </ul>
            <p class="conclusion">{{ diagnosis.conclusion }}</p>
          </template>
          <el-empty v-else description="等待诊断输入" />
        </article>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Bell,
  Cpu,
  House,
  MagicStick,
  Monitor,
  Refresh,
  Tickets
} from '@element-plus/icons-vue';

type ViewKey = 'overview' | 'assets' | 'monitor' | 'alerts' | 'tickets' | 'ai';

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

type Overview = {
  totalAssets: number;
  onlineAssets: number;
  activeAlerts: number;
  openWorkOrders: number;
  targetAvailability: number;
};

type Asset = {
  id: string;
  name: string;
  type: string;
  model: string;
  address: string;
  status: string;
  location: string;
  collector: string;
};

type MonitorTarget = {
  id: string;
  name: string;
  endpoint: string;
  source: string;
  status: string;
  latencyMs: number;
};

type AlertEvent = {
  id: string;
  assetId: string;
  title: string;
  severity: string;
  status: string;
  metric: string;
  summary: string;
};

type WorkOrder = {
  id: string;
  alertId: string;
  title: string;
  category: string;
  status: string;
  assignee: string;
  description: string;
};

type Diagnosis = {
  severity: string;
  possibleCauses: string[];
  recommendedActions: string[];
  conclusion: string;
};

type NodeInfo = {
  nodename?: string;
  sysname?: string;
  machine?: string;
  release?: string;
};

const navItems = [
  { key: 'overview', label: '运维总览', icon: House },
  { key: 'assets', label: '设备资产', icon: Cpu },
  { key: 'monitor', label: '监控目标', icon: Monitor },
  { key: 'alerts', label: '告警中心', icon: Bell },
  { key: 'tickets', label: '工单流转', icon: Tickets },
  { key: 'ai', label: 'AI 诊断', icon: MagicStick }
] as const;

const viewTitles: Record<ViewKey, string> = {
  overview: '运维总览',
  assets: '设备资产台账',
  monitor: '监控采集与 PromQL',
  alerts: '告警中心',
  tickets: '工单流转看板',
  ai: 'AI 故障诊断'
};

const activeView = ref<ViewKey>('overview');
const loading = ref(false);
const backendStatus = ref('检查中');
const overview = ref<Overview>({
  totalAssets: 0,
  onlineAssets: 0,
  activeAlerts: 0,
  openWorkOrders: 0,
  targetAvailability: 0
});
const assets = ref<Asset[]>([]);
const monitorTargets = ref<MonitorTarget[]>([]);
const alerts = ref<AlertEvent[]>([]);
const workOrders = ref<WorkOrder[]>([]);
const assetKeyword = ref('');
const promSource = ref<'docker' | 'wsl'>('docker');
const promQuery = ref('up');
const latestRaw = ref('');
const wslNodeStatus = ref('检查中');
const wslNode = ref<NodeInfo | null>(null);
const diagnoseQuestion = ref('Blackbox 链路探测失败，业务入口访问偶发超时。');
const diagnosing = ref(false);
const diagnosis = ref<Diagnosis | null>(null);

const ticketColumns = [
  { key: 'open', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'closed', label: '已关闭' }
];

const currentTitle = computed(() => viewTitles[activeView.value]);

const filteredAssets = computed(() => {
  const keyword = assetKeyword.value.trim().toLowerCase();
  if (!keyword) {
    return assets.value;
  }
  return assets.value.filter((asset) =>
    [asset.name, asset.address, asset.collector, asset.location].some((field) =>
      field.toLowerCase().includes(keyword)
    )
  );
});

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.code >= 400) {
    throw new Error(payload.message || `请求失败: ${url}`);
  }
  return payload.data;
}

async function loadHealth() {
  try {
    const health = await requestJson<{ status: string }>('/api/health');
    backendStatus.value = health.status ?? 'UNKNOWN';
  } catch {
    backendStatus.value = '未连接';
  }
}

async function loadOpsData() {
  const [overviewData, assetData, targetData, alertData, orderData] = await Promise.all([
    requestJson<Overview>('/api/ops/overview'),
    requestJson<Asset[]>('/api/ops/assets'),
    requestJson<MonitorTarget[]>('/api/ops/targets'),
    requestJson<AlertEvent[]>('/api/ops/alerts'),
    requestJson<WorkOrder[]>('/api/ops/work-orders')
  ]);
  overview.value = overviewData;
  assets.value = assetData;
  monitorTargets.value = targetData;
  alerts.value = alertData;
  workOrders.value = orderData;
}

async function queryPrometheus(source: 'docker' | 'wsl', query: string) {
  const data = await requestJson<{ raw: string }>(
    `/api/monitor/prometheus/query?source=${source}&query=${encodeURIComponent(query)}`
  );
  latestRaw.value = data.raw;
  return JSON.parse(data.raw);
}

async function loadWslNode() {
  try {
    const up = await queryPrometheus('wsl', 'up');
    const first = up?.data?.result?.[0];
    wslNodeStatus.value = first?.value?.[1] === '1' ? 'UP' : 'DOWN';

    const uname = await queryPrometheus('wsl', 'node_uname_info');
    wslNode.value = uname?.data?.result?.[0]?.metric ?? null;
  } catch {
    wslNodeStatus.value = '未连接';
    wslNode.value = null;
  }
}

async function runPromQuery() {
  try {
    await queryPrometheus(promSource.value, promQuery.value || 'up');
    ElMessage.success('PromQL 查询完成');
  } catch (error) {
    latestRaw.value = String(error);
    ElMessage.error('PromQL 查询失败');
  }
}

async function createTicket(alert: AlertEvent) {
  try {
    const order = await requestJson<WorkOrder>(`/api/ops/alerts/${alert.id}/work-orders`, {
      method: 'POST',
      body: JSON.stringify({
        title: `处理：${alert.title}`,
        category: alert.assetId.startsWith('net') ? 'network' : 'hardware',
        assignee: '值班工程师'
      })
    });
    ElMessage.success(`已生成工单 ${order.id}`);
    await loadOpsData();
    activeView.value = 'tickets';
  } catch (error) {
    ElMessage.error(String(error));
  }
}

async function runDiagnosis() {
  diagnosing.value = true;
  try {
    diagnosis.value = await requestJson<Diagnosis>('/api/ops/diagnose', {
      method: 'POST',
      body: JSON.stringify({ question: diagnoseQuestion.value })
    });
  } catch (error) {
    ElMessage.error(String(error));
  } finally {
    diagnosing.value = false;
  }
}

async function refreshAll() {
  loading.value = true;
  try {
    await loadHealth();
    await loadOpsData();
    await loadWslNode();
  } finally {
    loading.value = false;
  }
}

function statusTag(status: string) {
  if (status === 'online' || status === 'UP') {
    return 'success';
  }
  if (status === 'warning') {
    return 'warning';
  }
  return 'danger';
}

function statusText(status: string) {
  const labels: Record<string, string> = {
    online: '在线',
    warning: '告警',
    offline: '离线'
  };
  return labels[status] ?? status;
}

function severityTag(severity: string) {
  return severity === 'P2' ? 'danger' : severity === 'P3' ? 'warning' : 'info';
}

function ordersByStatus(status: string) {
  return workOrders.value.filter((order) => order.status === status);
}

onMounted(refreshAll);
</script>
