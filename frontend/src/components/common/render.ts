import { defineComponent, h } from 'vue';
import type { WorkOrder } from '../../types/ops';

export const Sparkline = defineComponent({
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

export const MiniTrend = defineComponent({
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

export function metricCard(title: string, value: string, change: string, tone: string, icon: unknown) {
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

export function panelHead(title: string, meta: string) {
  return h('div', { class: 'panel-head' }, [h('h2', title), h('button', typeButtonAttrs(), meta)]);
}

export function commandItem(label: string, description: string, value: string, tone: string) {
  return h('article', { class: ['command-item', tone] }, [
    h('span', label),
    h('strong', value),
    h('p', description)
  ]);
}

export function simpleTable(headers: string[], rows: string[][], extra?: unknown) {
  return h('div', { class: 'data-table-wrap' }, [
    h('table', { class: 'data-table' }, [
      h('thead', h('tr', headers.map((header) => h('th', header)))),
      h('tbody', rows.map((row) => h('tr', row.map((cell) => h('td', renderCell(cell))))))
    ]),
    extra
  ]);
}

export function trendChart() {
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

export function legendItem(label: string, value: string, color: string) {
  return h('li', [h('i', { class: color }), h('span', label), h('strong', value)]);
}

export function usageCard(title: string, value: string, tone: string) {
  return h('article', { class: 'usage-card' }, [
    h('span', title),
    h('strong', value),
    h(Sparkline, { tone })
  ]);
}

export function ticketColumn(title: string, orders: WorkOrder[]) {
  return h('article', { class: 'mini-ticket-col' }, [
    h('h3', `${title} (${orders.length})`),
    ...(orders.length
      ? orders.slice(0, 3).map((order) => h('div', { class: 'mini-ticket' }, [
        h('strong', order.id),
        h('span', order.title),
        h('em', `处理人：${order.assignee}`)
      ]))
      : [emptyState('当前无待处理工单')])
  ]);
}

export function kanbanColumn(title: string, orders: WorkOrder[]) {
  const fallback = orders.length ? orders : demoOrdersByColumn(title);
  return h('article', { class: 'kanban-col' }, [
    h('h3', `${title} (${fallback.length})`),
    ...(fallback.length
      ? fallback.map((order) => h('div', { class: 'work-card' }, [
        h('strong', order.title),
        h('span', order.id),
        h('p', order.description),
        h('footer', [h('em', order.assignee), h('b', order.category)])
      ]))
      : [emptyState('暂无流转记录')])
  ]);
}

export function emptyState(text: string) {
  return h('div', { class: 'empty-state' }, [
    h('strong', text),
    h('span', '暂无需要立即处理的记录')
  ]);
}

export function detailLine(label: string, value: string) {
  return h('p', { class: 'detail-line' }, [h('span', label), h('strong', value)]);
}

export function ringCard(value: string, label: string, tone: string) {
  return h('article', { class: ['ring-card', tone] }, [h('div', { class: 'ring' }, value), h('p', label), h('small', '较昨日 +2.3%')]);
}

export function barItem(label: string, percent: number, tone: string) {
  return h('div', { class: 'bar-item' }, [
    h('span', label),
    h('div', { class: 'bar-track' }, h('i', { class: tone, style: `width:${percent}%` })),
    h('strong', String(percent))
  ]);
}

export function statusLabel(status: string) {
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

function typeButtonAttrs() {
  return { type: 'button', class: 'text-link' };
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

function demoOrdersByColumn(title: string): WorkOrder[] {
  if (title.includes('待接单') || title.includes('待分派')) {
    return [{
      id: 'WO-20260513-2001',
      alertId: 'INC-20260513-009',
      title: '处理：出口链路 HTTP 探测抖动',
      category: 'network',
      status: 'open',
      assignee: '李四',
      description: 'Blackbox 探测出现间歇超时，需检查 DNS 与防火墙策略。'
    }];
  }
  if (title.includes('处理中')) {
    return [{
      id: 'WO-20260513-2002',
      alertId: 'INC-20260513-010',
      title: 'Linux 节点负载观察',
      category: 'hardware',
      status: 'processing',
      assignee: '李四',
      description: 'node_exporter 指标显示 CPU 短时升高，持续观察并记录。'
    }];
  }
  return [];
}
