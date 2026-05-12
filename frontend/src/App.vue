<template>
  <main v-if="!session" class="login-shell">
    <section class="login-hero">
      <div class="login-brand">
        <span class="brand-symbol">◇</span>
        <div>
          <strong>ICT 智能运维平台</strong>
          <small>面向企业基础设施的监控、告警与工单闭环</small>
        </div>
      </div>

      <div class="role-switch">
        <button :class="{ active: loginRole === 'admin' }" type="button" @click="loginRole = 'admin'">
          管理员入口
        </button>
        <button :class="{ active: loginRole === 'maintainer' }" type="button" @click="loginRole = 'maintainer'">
          维护人员入口
        </button>
      </div>

      <div class="hero-copy">
        <p>{{ loginRole === 'admin' ? 'ADMIN CONSOLE' : 'MAINTENANCE DESK' }}</p>
        <h1>{{ loginConfig.title }}</h1>
        <span>{{ loginConfig.description }}</span>
      </div>

      <div class="ops-visual">
        <div class="ops-map-lines">
          <span class="line-one"></span>
          <span class="line-two"></span>
          <span class="line-three"></span>
        </div>
        <div class="ops-card node-card left">
          <span>核心交换机-01</span>
          <strong>在线</strong>
        </div>
        <div class="ops-card node-card right">
          <span>{{ loginRole === 'admin' ? '告警总数' : '待办工单' }}</span>
          <strong>{{ loginRole === 'admin' ? '38' : '7' }}</strong>
        </div>
        <div class="core-device">
          <i>◇</i>
          <strong>核心设备</strong>
          <small>{{ loginRole === 'admin' ? '统一纳管' : '现场处置' }}</small>
        </div>
        <div class="device-node node-prom">
          <span>Prometheus</span>
          <strong>UP</strong>
        </div>
        <div class="device-node node-redis">
          <span>Redis</span>
          <strong>Ready</strong>
        </div>
        <div class="device-node node-linux">
          <span>Linux VM</span>
          <strong>node_exporter</strong>
        </div>
        <div class="ops-card node-card bottom">
          <span>服务可用率</span>
          <strong>99.95%</strong>
        </div>
      </div>

      <div class="login-stats">
        <article v-for="item in loginStats" :key="item.label">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </article>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-card">
        <div class="login-card-title">
          <el-icon><component :is="loginConfig.icon" /></el-icon>
          <div>
            <h2>{{ loginConfig.formTitle }}</h2>
            <p>{{ loginConfig.formHint }}</p>
          </div>
        </div>

        <label>
          <span>{{ loginRole === 'admin' ? '管理员账号' : '维护人员工号' }}</span>
          <input v-model="loginForm.account" :placeholder="loginRole === 'admin' ? 'admin' : 'ops001'" />
        </label>
        <label>
          <span>密码</span>
          <input v-model="loginForm.password" placeholder="任意输入用于演示" type="password" />
        </label>
        <label v-if="loginRole === 'maintainer'">
          <span>班组</span>
          <select v-model="loginForm.team">
            <option>运维一组</option>
            <option>网络组</option>
            <option>数据底座组</option>
          </select>
        </label>

        <div class="login-options">
          <label class="checkline">
            <input v-model="loginForm.remember" type="checkbox" />
            <span>记住登录状态</span>
          </label>
          <button type="button" @click="switchLoginRole">{{ loginConfig.altEntry }}</button>
        </div>

        <el-button class="login-submit" type="primary" @click="login">
          {{ loginConfig.action }}
        </el-button>
      </div>
    </section>
  </main>

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
import {
  ArrowDown,
  Bell,
  Box,
  Briefcase,
  CircleCheck,
  CirclePlus,
  Cpu,
  DataAnalysis,
  Document,
  Download,
  Fold,
  Histogram,
  House,
  Key,
  Lightning,
  MagicStick,
  Monitor,
  Operation,
  Refresh,
  Search,
  Setting,
  SwitchButton,
  Tickets,
  Tools,
  Warning
} from '@element-plus/icons-vue';

type Role = 'admin' | 'maintainer';
type AdminView = 'overview' | 'monitor' | 'assets' | 'alerts' | 'tickets' | 'automation' | 'reports' | 'settings';
type MaintainerView = 'myTickets' | 'todoAlerts' | 'deviceStatus' | 'records';
type ViewKey = AdminView | MaintainerView;

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

const Sparkline = defineComponent({
  name: 'Sparkline',
  props: {
    tone: { type: String, default: 'teal' }
  },
  setup(props) {
    const points = props.tone === 'orange'
      ? '0,22 12,15 24,18 36,10 48,13 60,8 72,19 84,11 96,16 108,12'
      : props.tone === 'blue'
        ? '0,20 12,13 24,18 36,9 48,15 60,11 72,12 84,14 96,12 108,15'
        : '0,18 12,16 24,19 36,12 48,18 60,8 72,16 84,11 96,14 108,9';
    return () => h('svg', { class: `spark ${props.tone}`, viewBox: '0 0 108 28' }, [
      h('polyline', { points, fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
    ]);
  }
});

const StatusDot = defineComponent({
  name: 'StatusDot',
  props: {
    status: { type: String, required: true }
  },
  setup(props) {
    return () => h('span', { class: ['status-dot', props.status] });
  }
});

const MiniTrend = defineComponent({
  name: 'MiniTrend',
  setup() {
    return () => h('div', { class: 'mini-trend' }, [
      h('div', { style: 'height:46%' }),
      h('div', { style: 'height:68%' }),
      h('div', { style: 'height:54%' }),
      h('div', { style: 'height:76%' }),
      h('div', { style: 'height:60%' }),
      h('div', { style: 'height:82%' }),
      h('div', { style: 'height:52%' })
    ]);
  }
});

const AdminDashboard = defineComponent({
  name: 'AdminDashboard',
  components: { Sparkline, StatusDot },
  props: {
    overview: { type: Object as () => Overview, required: true },
    alerts: { type: Array as () => AlertEvent[], required: true },
    assets: { type: Array as () => Asset[], required: true },
    targets: { type: Array as () => MonitorTarget[], required: true },
    workOrders: { type: Array as () => WorkOrder[], required: true }
  },
  setup(props) {
    return () => h('div', { class: 'page-grid admin-overview' }, [
      h('section', { class: 'kpi-row' }, [
        metricCard('在线设备', String(Math.max(props.overview.onlineAssets, 116)), '+3.31%', 'teal', Monitor),
        metricCard('活跃告警', String(Math.max(props.overview.activeAlerts, 9)), '-17.65%', 'orange', Bell),
        metricCard('今日工单', String(Math.max(props.overview.openWorkOrders, 23)), '+12.00%', 'blue', Document),
        metricCard('服务可用率', `${props.overview.targetAvailability || 99.95}%`, '+0.02%', 'green', CircleCheck),
        metricCard('自动化成功率', '98.61%', '-0.35%', 'blue', MagicStick)
      ]),
      h('section', { class: 'panel service-health' }, [
        panelHead('核心服务健康度', '关键链路实时状态'),
        simpleTable(['服务名称', '状态', '响应时间', '可用率'], [
          ['API 网关', '正常', '12ms', '99.98%'],
          ['CMDB', '正常', '18ms', '99.99%'],
          ['日志采集', '正常', '25ms', '99.90%'],
          ['监控引擎', '正常', '15ms', '99.97%'],
          ['数据库集群', '正常', '8ms', '99.99%']
        ])
      ]),
      h('section', { class: 'panel trend-panel' }, [
        panelHead('近 24 小时告警趋势', '按等级聚合'),
        trendChart()
      ]),
      h('section', { class: 'panel donut-panel' }, [
        panelHead('告警级别分布', '当前活跃告警'),
        h('div', { class: 'donut-wrap' }, [
          h('div', { class: 'donut' }, [h('span', '总计'), h('strong', String(Math.max(props.alerts.length, 28)))]),
          h('ul', { class: 'legend' }, [
            legendItem('紧急', '2 (7.14%)', 'red'),
            legendItem('重要', '8 (28.57%)', 'orange'),
            legendItem('一般', '12 (42.86%)', 'blue'),
            legendItem('提示', '6 (21.43%)', 'green')
          ])
        ])
      ]),
      h('section', { class: 'panel resource-panel' }, [
        panelHead('资源使用概览', '生产环境'),
        h('div', { class: 'resource-grid' }, [
          usageCard('CPU 使用率', '32.6%', 'green'),
          usageCard('内存使用率', '64.8%', 'blue'),
          usageCard('磁盘使用率', '71.3%', 'purple'),
          usageCard('网络吞吐（出）', '154.6 Mbps', 'teal')
        ])
      ]),
      h('section', { class: 'panel latest-alerts' }, [
        panelHead('最新告警', '查看更多'),
        simpleTable(['级别', '告警名称', '来源对象', '状态'], props.alerts.slice(0, 5).map((alert) => [
          alert.severity,
          alert.title,
          alert.assetId,
          statusLabel(alert.status)
        ]))
      ]),
      h('section', { class: 'panel tickets-panel' }, [
        panelHead('待处理工单', '按状态分组'),
        h('div', { class: 'ticket-mini-columns' }, [
          ticketColumn('待分派', props.workOrders.filter((item) => item.status === 'open')),
          ticketColumn('处理中', props.workOrders.filter((item) => item.status === 'processing')),
          ticketColumn('待验证', [])
        ])
      ]),
      h('section', { class: 'panel wide-table automation-table' }, [
        panelHead('最近自动化任务执行记录', '查看更多'),
        simpleTable(['任务名称', '目标范围', '执行结果', '执行时间', '操作人'], [
          ['日常健康检查', '全网设备', '成功', '2025-05-20 10:30:02', 'system'],
          ['配置备份', '核心网络设备', '成功', '2025-05-20 10:00:01', 'system'],
          ['日志清理', '日志服务器集群', '成功', '2025-05-20 09:30:01', 'system'],
          ['安全漏洞扫描', 'Web 应用集群', '部分成功', '2025-05-20 09:00:03', 'system']
        ])
      ])
    ]);
  }
});

const AdminResources = defineComponent({
  name: 'AdminResources',
  components: { MiniTrend },
  props: {
    assets: { type: Array as () => Asset[], required: true },
    targets: { type: Array as () => MonitorTarget[], required: true }
  },
  setup(props) {
    return () => h('div', { class: 'page-grid resources-page' }, [
      h('section', { class: 'kpi-row' }, [
        metricCard('资源总数', String(Math.max(props.assets.length, 2568)), '+3.21%', 'teal', Briefcase),
        metricCard('在线主机', String(props.assets.filter((item) => item.status === 'online').length || 1892), '+2.18%', 'green', Monitor),
        metricCard('网络设备', '218', '+1.40%', 'blue', Box),
        metricCard('数据库实例', '136', '+0.74%', 'purple', DataAnalysis),
        metricCard('异常资源', String(props.assets.filter((item) => item.status !== 'online').length || 38), '-11.63%', 'red', Warning)
      ]),
      h('section', { class: 'panel asset-table-panel' }, [
        panelHead('资源列表', '按环境、状态和责任人筛选'),
        simpleTable(['资源名称', 'IP 地址', '资源类型', '所属集群/项目', '状态', '最近巡检', '责任人', '操作'], props.assets.map((asset) => [
          asset.name,
          asset.address,
          asset.type,
          asset.location,
          statusLabel(asset.status),
          '2025-05-20 10:21',
          asset.id.includes('wsl') ? '张伟' : '李娜',
          '详情  监控  更多'
        ]))
      ]),
      h('section', { class: 'panel asset-detail' }, [
        panelHead('资源详情', 'web-prod-01'),
        h('div', { class: 'detail-grid' }, [
          h('div', [h('h3', '基础信息'), detailLine('资源名称', 'web-prod-01'), detailLine('IP 地址', '10.10.1.11'), detailLine('操作系统', 'Ubuntu 22.04 LTS'), detailLine('责任人', '张伟')]),
          h('div', [h('h3', '运行状态'), detailLine('状态', '正常'), detailLine('CPU 使用率', '24.6%'), detailLine('内存使用率', '45.3%'), detailLine('网络流入', '128.6 Mbps')]),
          h('div', [h('h3', 'CPU / 内存趋势'), h(MiniTrend)])
        ]),
        h('div', { class: 'sub-panels' }, [
          h('article', [h('h3', '最近告警'), h('p', '磁盘使用率过高  重要')]),
          h('article', [h('h3', '关联服务'), h('p', 'portal-web-service  正常')])
        ])
      ]),
      h('section', { class: 'panel wide-table' }, [
        panelHead('资源分组与容量概览', '生产环境'),
        h('div', { class: 'capacity-row' }, [
          ringCard('42.6%', 'CPU 已用 542.6 / 1280 核', 'teal'),
          ringCard('58.3%', '内存已用 1.82 / 3.12 TB', 'blue'),
          ringCard('61.7%', '磁盘已用 48.3 / 78.3 TB', 'orange'),
          ringCard('37.9%', '带宽已用 3.79 / 10 Gbps', 'purple')
        ])
      ])
    ]);
  }
});

const AdminAlerts = defineComponent({
  name: 'AdminAlerts',
  props: {
    alerts: { type: Array as () => AlertEvent[], required: true }
  },
  emits: ['createTicket'],
  setup(props, { emit }) {
    return () => h('div', { class: 'page-grid alerts-page' }, [
      h('section', { class: 'kpi-row four' }, [
        metricCard('当前活跃告警', '128', '+18.52%', 'red', Bell),
        metricCard('24h 新增告警', '342', '+22.18%', 'orange', Document),
        metricCard('已恢复告警', '214', '-8.76%', 'green', CircleCheck),
        metricCard('误报率', '2.35%', '-0.48%', 'blue', Warning)
      ]),
      h('section', { class: 'panel alert-trend' }, [panelHead('告警趋势', '近 24 小时告警变化'), trendChart()]),
      h('section', { class: 'panel alert-source' }, [
        panelHead('告警来源分布', '按对象类型'),
        h('div', { class: 'bar-list' }, [
          barItem('主机监控', 92, 'red'),
          barItem('网络设备', 72, 'orange'),
          barItem('数据库', 42, 'blue'),
          barItem('中间件', 28, 'green')
        ])
      ]),
      h('section', { class: 'panel alert-table' }, [
        panelHead('告警列表', '统一告警接入、关联分析与闭环处理'),
        simpleTable(['级别', '告警名称', '来源对象', '对象 IP', '状态', '处理人', '操作'], props.alerts.map((alert) => [
          alert.severity,
          alert.title,
          alert.assetId,
          '10.10.20.15',
          statusLabel(alert.status),
          alert.status === 'processing' ? '李四' : '-',
          '处理  派单  更多'
        ])),
        h('button', { class: 'primary-button table-action', onClick: () => emit('createTicket', props.alerts[0]) }, '选中告警转工单')
      ]),
      h('aside', { class: 'panel alert-detail' }, [
        panelHead('告警详情', '应用服务响应超时告警'),
        detailLine('状态', '未处理'),
        detailLine('首次发生', '2025-05-20 10:21:35'),
        detailLine('持续时长', '2 小时 18 分'),
        h('h3', '处理建议'),
        h('ol', [h('li', '检查订单服务健康状态'), h('li', '查看应用日志定位慢接口'), h('li', '必要时进行服务重启或扩容')])
      ])
    ]);
  }
});

const AdminTickets = defineComponent({
  name: 'AdminTickets',
  props: {
    workOrders: { type: Array as () => WorkOrder[], required: true }
  },
  setup(props) {
    return () => h('div', { class: 'page-grid tickets-page' }, [
      h('section', { class: 'kpi-row' }, [
        metricCard('待处理工单', String(props.workOrders.filter((item) => item.status === 'open').length || 32), '-20.00%', 'teal', Tickets),
        metricCard('处理中工单', String(props.workOrders.filter((item) => item.status === 'processing').length || 58), '+7.41%', 'blue', Document),
        metricCard('即将超时', '9', '-10.00%', 'orange', Warning),
        metricCard('已完成', '128', '+18.52%', 'green', CircleCheck),
        metricCard('平均处理时长', '2.6 小时', '-12.50%', 'gray', Operation)
      ]),
      h('section', { class: 'panel kanban-panel' }, [
        panelHead('工单看板', '按状态推进'),
        h('div', { class: 'kanban-board' }, [
          kanbanColumn('待分派', props.workOrders.filter((item) => item.status === 'open')),
          kanbanColumn('处理中', props.workOrders.filter((item) => item.status === 'processing')),
          kanbanColumn('待验证', []),
          kanbanColumn('已完成', [])
        ])
      ]),
      h('section', { class: 'panel ticket-table' }, [
        panelHead('工单列表', '按 SLA 和责任组筛选'),
        simpleTable(['工单编号', '标题', '类型', '优先级', '状态', '发起人', '处理人', 'SLA'], props.workOrders.map((order) => [
          order.id,
          order.title,
          order.category,
          order.category === 'network' ? '高' : '中',
          statusLabel(order.status),
          '系统',
          order.assignee,
          '8小时内'
        ]))
      ]),
      h('aside', { class: 'panel ticket-detail' }, [
        panelHead('工单详情', '安全补丁更新'),
        detailLine('工单编号', '202505200301'),
        detailLine('优先级', '高'),
        detailLine('状态', '处理中'),
        detailLine('责任组', '运维一组'),
        h('div', { class: 'sla-bar' }, h('span', { style: 'width:90%' })),
        h('h3', '处理流程'),
        h('ul', { class: 'process-list' }, [h('li', '工单创建'), h('li', '工单分派'), h('li', '开始处理'), h('li', '更新补丁')])
      ])
    ]);
  }
});

const MaintainerDesk = defineComponent({
  name: 'MaintainerDesk',
  props: {
    workOrders: { type: Array as () => WorkOrder[], required: true },
    diagnosis: { type: Object as () => Diagnosis | null, default: null },
    diagnosing: { type: Boolean, default: false },
    question: { type: String, required: true }
  },
  emits: ['diagnose', 'update:question'],
  setup(props, { emit }) {
    return () => h('div', { class: 'page-grid maintainer-desk' }, [
      h('section', { class: 'maintainer-main' }, [
        h('section', { class: 'kpi-row four' }, [
          metricCard('待处理工单', String(props.workOrders.length || 7), '-2', 'blue', Tickets),
          metricCard('即将超时', '2', '+1', 'orange', Warning),
          metricCard('今日已完成', '11', '+3', 'green', CircleCheck),
          metricCard('平均响应', '8分钟', '-2分钟', 'blue', Lightning)
        ]),
        h('section', { class: 'panel my-kanban' }, [
          panelHead('我的工单', '只显示当前维护人员相关任务'),
          h('div', { class: 'kanban-board compact maintainer-board' }, [
            kanbanColumn('待接单', props.workOrders.filter((item) => item.status === 'open')),
            kanbanColumn('处理中', props.workOrders.filter((item) => item.status === 'processing')),
            kanbanColumn('待验证', []),
            kanbanColumn('已完成', [])
          ])
        ])
      ]),
      h('aside', { class: 'panel action-detail' }, [
        panelHead('工单详情', 'AI 辅助诊断'),
        h('div', { class: 'incident-title' }, [
          h('span', '紧急'),
          h('strong', 'WO-20260512-1001'),
          h('em', '处理中')
        ]),
        detailLine('优先级', '紧急'),
        detailLine('状态', '处理中'),
        detailLine('SLA 剩余时间', '01:18:15'),
        detailLine('关联告警', 'INC20260512088'),
        detailLine('告警来源', 'Zabbix / 监控告警'),
        detailLine('关联设备', '核心交换机 core-sw-01'),
        h('h3', '故障描述'),
        h('p', { class: 'incident-desc' }, 'CPU 使用率持续高于 92%，部分业务访问出现延迟，需要优先排查接口流量与设备负载。'),
        h('h3', 'AI 诊断建议'),
        h('textarea', {
          value: props.question,
          onInput: (event: Event) => emit('update:question', (event.target as HTMLTextAreaElement).value)
        }),
        h('button', { class: 'primary-button full', onClick: () => emit('diagnose') }, props.diagnosing ? '诊断中...' : '生成诊断建议'),
        props.diagnosis
          ? h('div', { class: 'diagnosis-card' }, [
            h('strong', `${props.diagnosis.severity} 事件`),
            h('p', props.diagnosis.conclusion),
            h('ul', props.diagnosis.recommendedActions.slice(0, 3).map((item) => h('li', item)))
          ])
          : h('p', { class: 'muted' }, '输入故障现象后生成处置建议。'),
        h('div', { class: 'work-actions' }, [
          h('button', { class: 'primary-button', type: 'button' }, '接单'),
          h('button', { class: 'outline-button strong', type: 'button' }, '转派'),
          h('button', { class: 'primary-button', type: 'button' }, '提交处置'),
          h('button', { class: 'danger-button', type: 'button' }, '关闭工单')
        ]),
        h('h3', '处理记录'),
        h('ul', { class: 'record-list' }, [
          h('li', '10:21 工单创建'),
          h('li', '10:23 已指派给当前维护人员'),
          h('li', '10:26 维护人员查看工单')
        ])
      ])
    ]);
  }
});

const MaintainerAlerts = defineComponent({
  name: 'MaintainerAlerts',
  props: {
    alerts: { type: Array as () => AlertEvent[], required: true }
  },
  emits: ['createTicket'],
  setup(props, { emit }) {
    return () => h('div', { class: 'page-grid maintainer-alerts' }, [
      h('section', { class: 'panel wide-table' }, [
        panelHead('告警待办', '一线维护人员只处理分派范围内告警'),
        simpleTable(['级别', '告警名称', '来源对象', '指标', '状态', '操作'], props.alerts.map((alert) => [
          alert.severity,
          alert.title,
          alert.assetId,
          alert.metric,
          statusLabel(alert.status),
          '接单  转工单'
        ])),
        h('button', { class: 'primary-button table-action', onClick: () => emit('createTicket', props.alerts[0]) }, '转入我的工单')
      ])
    ]);
  }
});

const MaintainerDevices = defineComponent({
  name: 'MaintainerDevices',
  props: {
    assets: { type: Array as () => Asset[], required: true },
    targets: { type: Array as () => MonitorTarget[], required: true },
    wslNode: { type: Object as () => NodeInfo | null, default: null },
    wslNodeStatus: { type: String, required: true }
  },
  setup(props) {
    return () => h('div', { class: 'page-grid maintainer-devices' }, [
      h('section', { class: 'panel wide-table' }, [
        panelHead('设备状态', '维护范围内资产和采集目标'),
        simpleTable(['设备名称', '地址', '类型', '状态', '采集方式'], props.assets.map((asset) => [
          asset.name,
          asset.address,
          asset.type,
          statusLabel(asset.status),
          asset.collector
        ]))
      ]),
      h('aside', { class: 'panel action-detail' }, [
        panelHead('真实 Linux 节点', props.wslNodeStatus),
        detailLine('主机名', props.wslNode?.nodename ?? '-'),
        detailLine('系统', `${props.wslNode?.sysname ?? '-'} ${props.wslNode?.machine ?? ''}`),
        detailLine('内核', props.wslNode?.release ?? '-'),
        detailLine('采集源', 'Prometheus / node_exporter')
      ])
    ]);
  }
});

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

const loginRole = ref<Role>('admin');
const session = ref<{ role: Role; name: string } | null>(null);
const activeView = ref<ViewKey>('overview');
const loading = ref(false);
const loginForm = ref({ account: '', password: '', team: '运维一组', remember: true });

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
const wslNodeStatus = ref('检查中');
const wslNode = ref<NodeInfo | null>(null);
const diagnoseQuestion = ref('Blackbox 链路探测失败，业务入口访问偶发超时。');
const diagnosing = ref(false);
const diagnosis = ref<Diagnosis | null>(null);

const loginConfig = computed(() => {
  if (loginRole.value === 'admin') {
    return {
      title: '管理员后台',
      description: '管理资产、监控目标、告警规则、用户权限和自动化策略。',
      formTitle: '管理员登录',
      formHint: '进入完整管理控制台',
      action: '登录管理后台',
      altEntry: '维护人员入口',
      icon: Key
    };
  }
  return {
    title: '维护工作台',
    description: '聚焦我的告警、我的工单、SLA 和现场处置记录。',
    formTitle: '维护人员登录',
    formHint: '进入一线运维处理界面',
    action: '进入维护工作台',
    altEntry: '管理员入口',
    icon: Tools
  };
});

const loginStats = computed(() => loginRole.value === 'admin'
  ? [
    { value: '128', label: '纳管设备' },
    { value: '9', label: '活跃告警' },
    { value: '99.95%', label: '服务可用率' }
  ]
  : [
    { value: '7', label: '我的待办' },
    { value: '2', label: '即将超时' },
    { value: '8min', label: '平均响应' }
  ]);

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
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.code >= 400) {
    throw new Error(payload.message || `请求失败: ${url}`);
  }
  return payload.data;
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

function login() {
  session.value = {
    role: loginRole.value,
    name: loginRole.value === 'admin' ? '张伟' : '李四'
  };
  activeView.value = loginRole.value === 'admin' ? 'overview' : 'myTickets';
  refreshAll();
}

function logout() {
  session.value = null;
  activeView.value = 'overview';
}

function switchLoginRole() {
  loginRole.value = loginRole.value === 'admin' ? 'maintainer' : 'admin';
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

function metricCard(title: string, value: string, change: string, tone: string, icon: unknown) {
  return h('article', { class: ['metric-tile', tone] }, [
    h('div', { class: 'metric-icon' }, [h('el-icon', null, () => h(icon as object))]),
    h('div', { class: 'metric-main' }, [
      h('span', title),
      h('strong', value),
      h('small', ['较昨日 ', h('b', change)])
    ]),
    h(Sparkline, { tone })
  ]);
}

function panelHead(title: string, meta: string) {
  return h('div', { class: 'panel-head' }, [h('h2', title), h('button', typeButtonAttrs(), meta)]);
}

function typeButtonAttrs() {
  return { type: 'button', class: 'text-link' };
}

function simpleTable(headers: string[], rows: string[][], extra?: unknown) {
  return h('div', { class: 'data-table-wrap' }, [
    h('table', { class: 'data-table' }, [
      h('thead', h('tr', headers.map((header) => h('th', header)))),
      h('tbody', rows.map((row) => h('tr', row.map((cell) => h('td', renderCell(cell))))))
    ]),
    extra
  ]);
}

function renderCell(cell: string) {
  if (['正常', '成功', '已恢复', '已完成', 'online'].includes(cell)) {
    return h('span', { class: 'cell-success' }, cell);
  }
  if (['未处理', 'offline', '高', 'P2'].includes(cell)) {
    return h('span', { class: 'cell-danger' }, cell);
  }
  if (['处理中', '部分成功', 'warning', '中', 'P3'].includes(cell)) {
    return h('span', { class: 'cell-warning' }, cell);
  }
  return cell;
}

function trendChart() {
  return h('div', { class: 'trend-chart' }, [
    h('div', { class: 'trend-lines' }, [
      h('span', { class: 'line red' }),
      h('span', { class: 'line orange' }),
      h('span', { class: 'line blue' }),
      h('span', { class: 'line green' })
    ]),
    h('div', { class: 'grid-lines' })
  ]);
}

function legendItem(label: string, value: string, color: string) {
  return h('li', [h('i', { class: color }), h('span', label), h('strong', value)]);
}

function usageCard(title: string, value: string, tone: string) {
  return h('article', { class: 'usage-card' }, [
    h('span', title),
    h('strong', value),
    h(Sparkline, { tone })
  ]);
}

function ticketColumn(title: string, orders: WorkOrder[]) {
  return h('article', { class: 'mini-ticket-col' }, [
    h('h3', `${title} (${orders.length})`),
    ...orders.slice(0, 3).map((order) => h('div', { class: 'mini-ticket' }, [
      h('strong', order.id),
      h('span', order.title),
      h('em', `处理人：${order.assignee}`)
    ]))
  ]);
}

function kanbanColumn(title: string, orders: WorkOrder[]) {
  const fallback = orders.length ? orders : [];
  return h('article', { class: 'kanban-col' }, [
    h('h3', `${title} (${fallback.length})`),
    ...fallback.map((order) => h('div', { class: 'work-card' }, [
      h('strong', order.title),
      h('span', order.id),
      h('p', order.description),
      h('footer', [h('em', order.assignee), h('b', order.category)])
    ]))
  ]);
}

function detailLine(label: string, value: string) {
  return h('p', { class: 'detail-line' }, [h('span', label), h('strong', value)]);
}

function ringCard(value: string, label: string, tone: string) {
  return h('article', { class: ['ring-card', tone] }, [h('div', { class: 'ring' }, value), h('p', label), h('small', '较昨日 +2.3%')]);
}

function barItem(label: string, percent: number, tone: string) {
  return h('div', { class: 'bar-item' }, [
    h('span', label),
    h('div', { class: 'bar-track' }, h('i', { class: tone, style: `width:${percent}%` })),
    h('strong', String(percent))
  ]);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: '未处理',
    processing: '处理中',
    resolved: '已恢复',
    open: '未处理',
    closed: '已完成',
    online: '正常',
    warning: '告警',
    offline: '离线'
  };
  return labels[status] ?? status;
}

onMounted(() => {
  initPreviewSession();
  refreshAll();
});
</script>
