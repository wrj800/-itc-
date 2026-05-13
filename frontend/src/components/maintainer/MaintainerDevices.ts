import { defineComponent, h } from 'vue';
import type { Asset, MonitorTarget, NodeInfo } from '../../types/ops';
import {
  detailLine,
  panelHead,
  simpleTable,
  statusLabel
} from '../common/render';

export const MaintainerDevices = defineComponent({
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
