import type { LoginRole } from '../components/LoginView.vue';

export type Role = LoginRole;

export type AdminView = 'overview' | 'monitor' | 'assets' | 'alerts' | 'tickets' | 'automation' | 'reports' | 'settings';

export type MaintainerView = 'myTickets' | 'todoAlerts' | 'deviceStatus' | 'records';

export type ViewKey = AdminView | MaintainerView;

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type Overview = {
  totalAssets: number;
  onlineAssets: number;
  activeAlerts: number;
  openWorkOrders: number;
  targetAvailability: number;
};

export type Asset = {
  id: string;
  name: string;
  type: string;
  model: string;
  address: string;
  status: string;
  location: string;
  collector: string;
};

export type MonitorTarget = {
  id: string;
  name: string;
  endpoint: string;
  source: string;
  status: string;
  latencyMs: number;
};

export type AlertEvent = {
  id: string;
  assetId: string;
  title: string;
  severity: string;
  status: string;
  metric: string;
  summary: string;
};

export type WorkOrder = {
  id: string;
  alertId: string;
  title: string;
  category: string;
  status: string;
  assignee: string;
  description: string;
};

export type Diagnosis = {
  severity: string;
  possibleCauses: string[];
  recommendedActions: string[];
  conclusion: string;
};

export type NodeInfo = {
  nodename?: string;
  sysname?: string;
  machine?: string;
  release?: string;
};
