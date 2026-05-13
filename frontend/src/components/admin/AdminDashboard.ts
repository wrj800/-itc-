import { defineComponent, h } from 'vue';
import { Bell, CircleCheck, Document, MagicStick, Monitor } from '@element-plus/icons-vue';
import type { AlertEvent, Asset, MonitorTarget, Overview, WorkOrder } from '../../types/ops';
import {
  commandItem,
  legendItem,
  metricCard,
  panelHead,
  simpleTable,
  statusLabel,
  ticketColumn,
  trendChart,
  usageCard
} from '../common/render';

export const AdminDashboard = defineComponent({
  name: 'AdminDashboard',
  props: {
    overview: { type: Object as () => Overview, required: true },
    alerts: { type: Array as () => AlertEvent[], required: true },
    assets: { type: Array as () => Asset[], required: true },
    targets: { type: Array as () => MonitorTarget[], required: true },
    workOrders: { type: Array as () => WorkOrder[], required: true }
  },
  setup(props) {
    return () => h('div', { class: 'page-grid admin-overview' }, [
      h('section', { class: 'ops-command-bar' }, [
        commandItem('采集状态', 'Prometheus / Blackbox / Node Exporter', '全部在线', 'green'),
        commandItem('告警管道', '规则评估、事件归并、工单联动', '运行中', 'blue'),
        commandItem('SLA 风险', '紧急 2 个，重要 8 个', '需关注', 'orange'),
        commandItem('最近同步', '2026-05-13 09:30:18', '30s 前', 'teal')
      ]),
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
