import { defineComponent, h } from 'vue';
import { Box, Briefcase, DataAnalysis, Monitor, Warning } from '@element-plus/icons-vue';
import type { Asset, MonitorTarget } from '../../types/ops';
import {
  MiniTrend,
  detailLine,
  metricCard,
  panelHead,
  ringCard,
  simpleTable,
  statusLabel
} from '../common/render';

export const AdminResources = defineComponent({
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
