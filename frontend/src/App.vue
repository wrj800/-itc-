<template>
  <LoginView v-if="!session" @login="login" />

  <main v-else class="app-shell">
    <aside class="side-nav">
      <div class="side-brand">
        <span class="side-logo">◇</span>
        <strong>ICT 智能运维平台</strong>
      </div>

      <nav>
        <button
          v-for="item in currentNavItems"
          :key="item.key"
          :class="{ active: activeView === item.key }"
          type="button"
          @click="activeView = item.key"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button class="side-bottom" type="button" @click="logout">
        <el-icon><SwitchButton /></el-icon>
        <span>退出登录</span>
      </button>
    </aside>

    <section class="main-area">
      <header class="global-topbar">
        <button class="icon-button" type="button" aria-label="折叠菜单">
          <el-icon><Fold /></el-icon>
        </button>
        <div class="search-box">
          <input placeholder="搜索资源、指标、告警、工单等" />
          <el-icon><Search /></el-icon>
        </div>
        <div class="topbar-spacer"></div>
        <select>
          <option>生产环境</option>
          <option>测试环境</option>
        </select>
        <input class="date-range" value="2026-05-12 00:00 ~ 2026-05-12 23:59" readonly />
        <button class="outline-button" type="button" @click="refreshAll">
          <el-icon><Refresh /></el-icon>
          刷新
        </button>
        <button class="notice-button" type="button">
          <el-icon><Bell /></el-icon>
          <b>12</b>
        </button>
        <div class="user-chip">
          <span>{{ session.role === 'admin' ? '管' : '维' }}</span>
          <strong>{{ session.name }}</strong>
          <el-icon><ArrowDown /></el-icon>
        </div>
      </header>

      <section class="page-content">
        <header class="page-heading">
          <div>
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageSubtitle }}</p>
          </div>
          <div class="page-actions">
            <button v-if="session.role === 'admin'" class="outline-button strong" type="button">
              <el-icon><Download /></el-icon>
              导出报表
            </button>
            <button class="primary-button" type="button" @click="activeView = session.role === 'admin' ? 'tickets' : 'myTickets'">
              <el-icon><CirclePlus /></el-icon>
              {{ session.role === 'admin' ? '创建工单' : '提交处置' }}
            </button>
          </div>
        </header>

        <AdminDashboard
          v-if="session.role === 'admin' && activeView === 'overview'"
          :overview="overview"
          :alerts="alerts"
          :assets="assets"
          :targets="monitorTargets"
          :work-orders="workOrders"
        />

        <AdminResources
          v-else-if="session.role === 'admin' && activeView === 'assets'"
          :assets="assets"
          :targets="monitorTargets"
        />

        <AdminAlerts
          v-else-if="session.role === 'admin' && activeView === 'alerts'"
          :alerts="alerts"
          @create-ticket="createTicket"
        />

        <AdminTickets
          v-else-if="session.role === 'admin' && activeView === 'tickets'"
          :work-orders="workOrders"
        />

        <PlaceholderPage
          v-else-if="session.role === 'admin'"
          :title="pageTitle"
          :items="adminPlaceholderItems"
        />

        <MaintainerDesk
          v-else-if="session.role === 'maintainer' && activeView === 'myTickets'"
          :work-orders="workOrders"
          :diagnosis="diagnosis"
          :diagnosing="diagnosing"
          v-model:question="diagnoseQuestion"
          @diagnose="runDiagnosis"
        />

        <MaintainerAlerts
          v-else-if="session.role === 'maintainer' && activeView === 'todoAlerts'"
          :alerts="alerts"
          @create-ticket="createTicket"
        />

        <MaintainerDevices
          v-else-if="session.role === 'maintainer' && activeView === 'deviceStatus'"
          :assets="assets"
          :targets="monitorTargets"
          :wsl-node="wslNode"
          :wsl-node-status="wslNodeStatus"
        />

        <PlaceholderPage v-else :title="pageTitle" :items="maintainerPlaceholderItems" />
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import LoginView from './components/LoginView.vue';
import { AdminAlerts } from './components/admin/AdminAlerts';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminResources } from './components/admin/AdminResources';
import { AdminTickets } from './components/admin/AdminTickets';
import { MaintainerAlerts } from './components/maintainer/MaintainerAlerts';
import { MaintainerDevices } from './components/maintainer/MaintainerDevices';
import { MaintainerDesk } from './components/maintainer/MaintainerDesk';
import { panelHead } from './components/common/render';
import type {
  AdminView,
  ApiResponse,
  AlertEvent,
  Asset,
  Diagnosis,
  MaintainerView,
  MonitorTarget,
  NodeInfo,
  Overview,
  Role,
  ViewKey,
  WorkOrder
} from './types/ops';
import {
  ArrowDown,
  Bell,
  Box,
  CirclePlus,
  Document,
  Download,
  Fold,
  Histogram,
  House,
  MagicStick,
  Monitor,
  Operation,
  Refresh,
  Search,
  Setting,
  SwitchButton,
  Tickets
} from '@element-plus/icons-vue';

const PlaceholderPage = defineComponent({
  name: 'PlaceholderPage',
  props: {
    title: { type: String, required: true },
    items: { type: Array as () => string[], required: true }
  },
  setup(props) {
    return () => h('section', { class: 'panel placeholder-panel' }, [
      panelHead(props.title, '后续模块实施计划'),
      h('ul', props.items.map((item) => h('li', item)))
    ]);
  }
});

const adminNavItems = [
  { key: 'overview', label: '总览', icon: House },
  { key: 'monitor', label: '监控中心', icon: Monitor },
  { key: 'assets', label: '资源管理', icon: Box },
  { key: 'alerts', label: '告警中心', icon: Bell },
  { key: 'tickets', label: '工单中心', icon: Tickets },
  { key: 'automation', label: '自动化巡检', icon: Operation },
  { key: 'reports', label: '报表分析', icon: Histogram },
  { key: 'settings', label: '系统设置', icon: Setting }
] as const;

const maintainerNavItems = [
  { key: 'myTickets', label: '我的工单', icon: Tickets },
  { key: 'todoAlerts', label: '告警待办', icon: Bell },
  { key: 'deviceStatus', label: '设备状态', icon: Monitor },
  { key: 'records', label: '处置记录', icon: Document }
] as const;

const session = ref<{ role: Role; name: string } | null>(null);
const activeView = ref<ViewKey>('overview');
const loading = ref(false);

const demoOverview: Overview = {
  totalAssets: 2568,
  onlineAssets: 1892,
  activeAlerts: 38,
  openWorkOrders: 32,
  targetAvailability: 99.95
};

const demoAssets: Asset[] = [
  { id: 'srv-web-01', name: 'web-prod-01', type: 'Linux 服务器', model: 'Ubuntu 22.04', address: '10.10.1.11', status: 'online', location: '生产区 / Web 集群', collector: 'node_exporter' },
  { id: 'srv-db-01', name: 'mysql-core-01', type: '数据库实例', model: 'MySQL 8.0', address: '10.10.2.21', status: 'online', location: '生产区 / 数据库集群', collector: 'mysqld_exporter' },
  { id: 'net-core-01', name: 'core-sw-01', type: '核心交换机', model: 'VRP Simulator', address: '10.10.0.1', status: 'warning', location: '核心网络区', collector: 'snmp_exporter' },
  { id: 'wsl-node-01', name: 'linux-test-node', type: 'Linux 虚拟机', model: 'WSL2 / Ubuntu', address: '127.0.0.1:9100', status: 'online', location: '本机实验环境', collector: 'node_exporter' }
];

const demoMonitorTargets: MonitorTarget[] = [
  { id: 'prom-01', name: 'Prometheus', endpoint: 'http://127.0.0.1:9090/-/healthy', source: 'docker', status: 'up', latencyMs: 12 },
  { id: 'blackbox-01', name: '门户 HTTP 探测', endpoint: 'http://127.0.0.1:9115/probe', source: 'docker', status: 'up', latencyMs: 38 },
  { id: 'node-01', name: 'Linux 节点采集', endpoint: 'http://127.0.0.1:9100/metrics', source: 'wsl', status: 'up', latencyMs: 20 }
];

const demoAlerts: AlertEvent[] = [
  { id: 'INC-20260513-001', assetId: 'net-core-01', title: '核心交换机 CPU 使用率过高', severity: 'P2', status: 'active', metric: 'cpu_usage', summary: 'CPU 持续高于 92%，建议检查接口流量与控制面负载。' },
  { id: 'INC-20260513-002', assetId: 'srv-web-01', title: '门户服务 HTTP 探测超时', severity: 'P3', status: 'processing', metric: 'probe_success', summary: 'Blackbox 探测间歇失败，需要联动应用日志排查。' },
  { id: 'INC-20260513-003', assetId: 'srv-db-01', title: '数据库连接数接近阈值', severity: 'P3', status: 'resolved', metric: 'threads_connected', summary: '连接数峰值已恢复，继续观察慢 SQL。' }
];

const demoWorkOrders: WorkOrder[] = [
  { id: 'WO-20260513-1001', alertId: 'INC-20260513-001', title: '处理：核心交换机 CPU 使用率过高', category: 'network', status: 'processing', assignee: '李四', description: '排查核心交换机接口流量、路由震荡和控制面进程占用。' },
  { id: 'WO-20260513-1002', alertId: 'INC-20260513-002', title: '处理：门户服务 HTTP 探测超时', category: 'app', status: 'open', assignee: '王敏', description: '检查 Nginx、应用实例健康状态和 Blackbox 探测链路。' }
];

const overview = ref<Overview>({ ...demoOverview });
const assets = ref<Asset[]>([...demoAssets]);
const monitorTargets = ref<MonitorTarget[]>([...demoMonitorTargets]);
const alerts = ref<AlertEvent[]>([...demoAlerts]);
const workOrders = ref<WorkOrder[]>([...demoWorkOrders]);
const wslNodeStatus = ref('检查中');
const wslNode = ref<NodeInfo | null>(null);
const diagnoseQuestion = ref('Blackbox 链路探测失败，业务入口访问偶发超时。');
const diagnosing = ref(false);
const diagnosis = ref<Diagnosis | null>(null);

const currentNavItems = computed(() => session.value?.role === 'admin' ? adminNavItems : maintainerNavItems);
const pageTitle = computed(() => {
  const item = currentNavItems.value.find((nav) => nav.key === activeView.value);
  return item?.label ?? '工作台';
});
const pageSubtitle = computed(() => session.value?.role === 'admin'
  ? '统一管理接入、资源、告警、工单和自动化策略'
  : '维护人员处理告警、工单和现场处置记录');

const adminPlaceholderItems = [
  '接入 Prometheus Targets 与告警规则配置。',
  '自动化巡检任务支持定时执行与结果归档。',
  '报表分析后续输出可用于毕业设计答辩材料。',
  '系统设置用于角色、权限、环境参数和集成配置。'
];
const maintainerPlaceholderItems = [
  '处置记录后续按工单维度保存处理步骤、截图和验证结果。',
  '支持维护人员提交备注、转派、关闭和复核。',
  '后续可与 AI 诊断结果一起沉淀到知识库。'
];

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const text = await response.text();
  if (!text) {
    throw new Error(`接口无响应: ${url}`);
  }
  const payload = JSON.parse(text) as ApiResponse<T>;
  if (!response.ok || payload.code >= 400) {
    throw new Error(payload.message || `请求失败: ${url}`);
  }
  return payload.data;
}

async function loadOpsData() {
  try {
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
  } catch (error) {
    overview.value = { ...demoOverview };
    assets.value = [...demoAssets];
    monitorTargets.value = [...demoMonitorTargets];
    alerts.value = [...demoAlerts];
    workOrders.value = [...demoWorkOrders];
  }
}

async function queryPrometheus(source: 'docker' | 'wsl', query: string) {
  const data = await requestJson<{ raw: string }>(
    `/api/monitor/prometheus/query?source=${source}&query=${encodeURIComponent(query)}`
  );
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

async function createTicket(alert?: AlertEvent) {
  const target = alert ?? alerts.value[0];
  if (!target) {
    ElMessage.warning('当前没有可转工单的告警');
    return;
  }
  try {
    const order = await requestJson<WorkOrder>(`/api/ops/alerts/${target.id}/work-orders`, {
      method: 'POST',
      body: JSON.stringify({
        title: `处理：${target.title}`,
        category: target.assetId.startsWith('net') ? 'network' : 'hardware',
        assignee: session.value?.role === 'maintainer' ? session.value.name : '值班工程师'
      })
    });
    ElMessage.success(`已生成工单 ${order.id}`);
    await loadOpsData();
    activeView.value = session.value?.role === 'admin' ? 'tickets' : 'myTickets';
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
    await loadOpsData();
    await loadWslNode();
  } finally {
    loading.value = false;
  }
}

function login(role: Role) {
  session.value = {
    role,
    name: role === 'admin' ? '张伟' : '李四'
  };
  activeView.value = role === 'admin' ? 'overview' : 'myTickets';
  refreshAll();
}

function logout() {
  session.value = null;
  activeView.value = 'overview';
}

function initPreviewSession() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  const view = params.get('view');
  if (role === 'admin') {
    session.value = { role: 'admin', name: '张伟' };
    activeView.value = (view as ViewKey) || 'overview';
  }
  if (role === 'maintainer') {
    session.value = { role: 'maintainer', name: '李四' };
    activeView.value = (view as ViewKey) || 'myTickets';
  }
}

onMounted(() => {
  initPreviewSession();
  if (session.value) {
    refreshAll();
  }
});
</script>
