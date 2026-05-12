<template>
  <main class="shell">
    <section class="topbar">
      <div>
        <p class="eyebrow">ICT OPS</p>
        <h1>企业 ICT 智能运维平台</h1>
      </div>
      <el-button type="primary" @click="refreshAll">刷新状态</el-button>
    </section>

    <section class="grid">
      <article class="metric">
        <span>后端服务</span>
        <strong>{{ backendStatus }}</strong>
      </article>
      <article class="metric">
        <span>Docker 观测目标</span>
        <strong>{{ dockerTargets.length }}</strong>
      </article>
      <article class="metric">
        <span>真实 Linux 节点</span>
        <strong>{{ wslNodeStatus }}</strong>
      </article>
    </section>

    <section class="layout">
      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">PROMETHEUS</p>
            <h2>Docker 观测栈</h2>
          </div>
          <el-tag :type="dockerTargets.length > 0 ? 'success' : 'warning'">{{ dockerStatus }}</el-tag>
        </div>
        <ul class="target-list">
          <li v-for="target in dockerTargets" :key="target.instance + target.job">
            <span>{{ target.job }}</span>
            <strong>{{ target.instance }}</strong>
            <em :class="{ down: target.value !== '1' }">{{ target.value === '1' ? 'UP' : 'DOWN' }}</em>
          </li>
        </ul>
      </article>

      <article class="panel">
        <div class="panel-title">
          <div>
            <p class="eyebrow">REAL NODE</p>
            <h2>WSL Ubuntu 真实采集</h2>
          </div>
          <el-tag :type="wslNodeStatus === 'UP' ? 'success' : 'danger'">{{ wslNodeStatus }}</el-tag>
        </div>
        <dl class="node-info">
          <div>
            <dt>主机名</dt>
            <dd>{{ wslNode?.nodename ?? '-' }}</dd>
          </div>
          <div>
            <dt>系统</dt>
            <dd>{{ wslNode?.sysname ?? '-' }} {{ wslNode?.machine ?? '' }}</dd>
          </div>
          <div>
            <dt>内核</dt>
            <dd>{{ wslNode?.release ?? '-' }}</dd>
          </div>
          <div>
            <dt>采集源</dt>
            <dd>Prometheus / node_exporter</dd>
          </div>
        </dl>
      </article>
    </section>

    <section class="panel">
      <div class="panel-title">
        <div>
          <p class="eyebrow">RAW DATA</p>
          <h2>最近一次 Prometheus 响应</h2>
        </div>
      </div>
      <pre>{{ latestRaw }}</pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

type TargetStatus = {
  job: string;
  instance: string;
  value: string;
};

type NodeInfo = {
  nodename?: string;
  sysname?: string;
  machine?: string;
  release?: string;
};

const backendStatus = ref('检查中');
const dockerStatus = ref('检查中');
const wslNodeStatus = ref('检查中');
const dockerTargets = ref<TargetStatus[]>([]);
const wslNode = ref<NodeInfo | null>(null);
const latestRaw = ref('');

async function loadHealth() {
  try {
    const response = await fetch('/api/health');
    const payload = await response.json();
    backendStatus.value = payload?.data?.status ?? 'UNKNOWN';
  } catch {
    backendStatus.value = '未连接';
  }
}

async function queryPrometheus(source: 'docker' | 'wsl', query: string) {
  const response = await fetch(`/api/monitor/prometheus/query?source=${source}&query=${encodeURIComponent(query)}`);
  const payload = await response.json();
  latestRaw.value = payload?.data?.raw ?? '';
  return JSON.parse(payload.data.raw);
}

async function loadDockerTargets() {
  try {
    const parsed = await queryPrometheus('docker', 'up');
    dockerTargets.value = (parsed?.data?.result ?? []).map((item: any) => ({
      job: item.metric?.job ?? '-',
      instance: item.metric?.instance ?? '-',
      value: item.value?.[1] ?? '0'
    }));
    dockerStatus.value = dockerTargets.value.length > 0 ? 'UP' : 'EMPTY';
  } catch (error) {
    dockerStatus.value = '未连接';
    latestRaw.value = String(error);
  }
}

async function loadWslNode() {
  try {
    const up = await queryPrometheus('wsl', 'up');
    const first = up?.data?.result?.[0];
    wslNodeStatus.value = first?.value?.[1] === '1' ? 'UP' : 'DOWN';

    const uname = await queryPrometheus('wsl', 'node_uname_info');
    wslNode.value = uname?.data?.result?.[0]?.metric ?? null;
  } catch (error) {
    wslNodeStatus.value = '未连接';
    latestRaw.value = String(error);
  }
}

async function refreshAll() {
  await loadHealth();
  await loadDockerTargets();
  await loadWslNode();
}

onMounted(refreshAll);
</script>
