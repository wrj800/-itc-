import { defineComponent, h } from 'vue';
import { CircleCheck, Lightning, Tickets, Warning } from '@element-plus/icons-vue';
import type { Diagnosis, WorkOrder } from '../../types/ops';
import {
  detailLine,
  kanbanColumn,
  metricCard,
  panelHead
} from '../common/render';

export const MaintainerDesk = defineComponent({
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
        h('section', { class: 'shift-brief' }, [
          h('div', [h('span', '当前班组'), h('strong', '运维一组 / 白班')]),
          h('div', [h('span', '负责范围'), h('strong', '核心网络、Linux 节点、BMC 仿真')]),
          h('div', [h('span', '交接状态'), h('strong', '3 条待跟进记录')]),
          h('div', [h('span', '升级通道'), h('strong', 'P1 15 分钟内响应')])
        ]),
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
