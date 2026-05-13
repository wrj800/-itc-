import { defineComponent, h } from 'vue';
import type { AlertEvent } from '../../types/ops';
import {
  panelHead,
  simpleTable,
  statusLabel
} from '../common/render';

export const MaintainerAlerts = defineComponent({
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
