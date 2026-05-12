# 虚拟实验环境部署计划

## 一、推荐工具组合

### 最小可行组合

| 组件 | 用途 |
|---|---|
| VMware Workstation Pro 或 VirtualBox | 创建虚拟机 |
| Ubuntu Server | 模拟 Linux 服务器 |
| Prometheus | 采集和存储指标 |
| node_exporter | 采集 Linux 主机指标 |
| windows_exporter | 采集 Windows 主机指标，可选 |
| Blackbox Exporter | 探测 HTTP、TCP、ICMP |
| MySQL | 运维平台业务数据库 |
| Redis | 缓存 |
| Spring Boot | 运维平台后端 |
| Vue 3 | 运维平台前端 |
| FastAPI | AI 服务 |

### 进阶组合

| 组件 | 用途 |
|---|---|
| GNS3 | 网络拓扑模拟 |
| EVE-NG | 多厂商网络设备模拟 |
| SNMP Simulator | 模拟交换机/路由器 SNMP 数据 |
| IPMI Simulator | 模拟服务器 BMC 硬件传感器 |
| Grafana | 对比展示监控指标，可选 |

## 二、最小拓扑

| 节点 | 建议配置 | 作用 |
|---|---|---|
| `ops-manager` | 2C4G / 40G | 运维平台、Prometheus、MySQL、Redis |
| `linux-server-01` | 1C1G / 20G | 被监控 Linux 服务器 |
| `linux-server-02` | 1C1G / 20G | 被监控 Linux 服务器 |
| `app-node` | 1C1G / 20G | Nginx/MySQL/Redis 等服务节点 |

## 三、网络规划

| 项目 | 建议 |
|---|---|
| 网络模式 | Host-only 或 NAT |
| 网段 | `192.168.56.0/24` |
| 管理机 | `192.168.56.10` |
| Linux Server 01 | `192.168.56.21` |
| Linux Server 02 | `192.168.56.22` |
| App Node | `192.168.56.30` |

## 四、Prometheus 采集目标示例

```yaml
scrape_configs:
  - job_name: "linux-nodes"
    static_configs:
      - targets:
          - "192.168.56.21:9100"
          - "192.168.56.22:9100"

  - job_name: "blackbox-http"
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - "http://192.168.56.30"
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: "127.0.0.1:9115"
```

## 五、故障注入命令示例

### 5.1 CPU 过高

```bash
yes > /dev/null &
```

停止：

```bash
pkill yes
```

### 5.2 磁盘空间不足

```bash
dd if=/dev/zero of=/tmp/bigfile bs=100M count=20
```

清理：

```bash
rm -f /tmp/bigfile
```

### 5.3 Web 服务不可用

```bash
sudo systemctl stop nginx
```

恢复：

```bash
sudo systemctl start nginx
```

### 5.4 服务器离线

```bash
sudo shutdown now
```

## 六、平台需要实现的对接点

1. 后端配置 Prometheus 地址。
2. 设备表保存 exporter 地址。
3. 监控目标表保存目标 IP、端口、协议、采集方式。
4. 后端定时调用 Prometheus API。
5. 指标超过阈值时自动写入 `alarm_record`。
6. 前端大屏展示真实采集结果。
7. 告警可转为工单。
8. 工单处理时可调用 AI 诊断。
