import { defineComponent, h } from 'vue';
import { Bell, CircleCheck, Document, Warning } from '@element-plus/icons-vue';
import type { AlertEvent } from '../../types/ops';
import {
  barItem,
  detailLine,
  metricCard,
  panelHead,
  simpleTable,
  statusLabel,
  trendChart
} from '../common/render';

export const AdminAlerts = defineComponent({
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
