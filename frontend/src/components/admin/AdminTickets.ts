import { defineComponent, h } from 'vue';
import { CircleCheck, Document, Operation, Tickets, Warning } from '@element-plus/icons-vue';
import type { WorkOrder } from '../../types/ops';
import {
  detailLine,
  kanbanColumn,
  metricCard,
  panelHead,
  simpleTable,
  statusLabel
} from '../common/render';

export const AdminTickets = defineComponent({
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
