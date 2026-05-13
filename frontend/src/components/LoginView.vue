<template>
  <main class="login-shell">
    <section class="login-hero">
      <div class="login-brand">
        <span class="brand-symbol">◇</span>
        <div>
          <strong>ICT 智能运维平台</strong>
          <small>面向企业基础设施的监控、告警与工单闭环</small>
        </div>
      </div>

      <div class="role-switch">
        <button :class="{ active: loginRole === 'admin' }" type="button" @click="setLoginRole('admin')">
          管理员入口
        </button>
        <button :class="{ active: loginRole === 'maintainer' }" type="button" @click="setLoginRole('maintainer')">
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

        <div class="login-form-grid">
          <label class="login-field">
            <span class="login-field-label">{{ loginRole === 'admin' ? '管理员账号' : '维护人员工号' }}</span>
            <input v-model="loginForm.account" :placeholder="loginRole === 'admin' ? 'admin' : 'ops001'" />
          </label>
          <label class="login-field">
            <span class="login-field-label">登录密码</span>
            <input v-model="loginForm.password" placeholder="任意输入用于演示" type="password" />
          </label>
          <label class="login-field">
            <span class="login-field-label">{{ loginRole === 'admin' ? '管理范围' : '所属班组' }}</span>
            <select v-model="loginForm.scope">
              <option v-for="option in loginScopeOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
        </div>

        <div class="login-options">
          <label class="checkline">
            <input v-model="loginForm.remember" type="checkbox" />
            <span>记住登录状态</span>
          </label>
          <button type="button" @click="switchLoginRole">{{ loginConfig.altEntry }}</button>
        </div>

        <el-button class="login-submit" type="primary" @click="emitLogin">
          {{ loginConfig.action }}
        </el-button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Key, Tools } from '@element-plus/icons-vue';

export type LoginRole = 'admin' | 'maintainer';

const emit = defineEmits<{
  login: [role: LoginRole];
}>();

const loginRole = ref<LoginRole>('admin');
const loginForm = reactive({ account: '', password: '', scope: '全局管理控制台', remember: true });

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

const loginScopeOptions = computed(() => loginRole.value === 'admin'
  ? ['全局管理控制台', '资源与告警管理', '工单与报表审计']
  : ['运维一组', '网络组', '数据底座组']);

function setLoginRole(role: LoginRole) {
  loginRole.value = role;
  loginForm.scope = loginScopeOptions.value[0];
}

function switchLoginRole() {
  setLoginRole(loginRole.value === 'admin' ? 'maintainer' : 'admin');
}

function emitLogin() {
  emit('login', loginRole.value);
}

function initPreviewRole() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  const loginRoleParam = params.get('loginRole');
  if (!role && (loginRoleParam === 'admin' || loginRoleParam === 'maintainer')) {
    setLoginRole(loginRoleParam);
  }
}

initPreviewRole();
</script>
