# WSL 真实 Linux 节点接入说明

本项目已经在 `Ubuntu-24.04` WSL2 发行版中安装真实 `node_exporter` 和独立 Prometheus，用于毕业设计中的真实 Linux 主机运维监控演示。

## 已安装组件

| 组件 | 位置 | 端口 | 作用 |
|---|---|---:|---|
| node_exporter v1.10.2 | `/usr/local/bin/node_exporter` | `19100` | 采集 Linux CPU、内存、磁盘、网络等真实指标 |
| Prometheus v3.7.3 | `/usr/local/bin/prometheus` | `19090` | 在 WSL 内本地抓取 `127.0.0.1:19100` |

## 启动

```powershell
cd E:\.AA毕业设计\10_项目源码
powershell -ExecutionPolicy Bypass -File .\scripts\start-wsl-real-node.ps1
```

## 验证

```powershell
cd E:\.AA毕业设计\10_项目源码
powershell -ExecutionPolicy Bypass -File .\scripts\check-wsl-real-node.ps1
```

关键验证项：

```text
up{job="wsl-ubuntu-node"} = 1
node_uname_info{nodename="heyan", sysname="Linux"} = 1
```

## 与 Docker 观测栈的关系

Docker Prometheus 地址为 `http://127.0.0.1:9090`，主要采集 Redis、Docker node_exporter、Blackbox Exporter 等容器侧目标。

WSL Prometheus 地址形如 `http://<WSL-IP>:19090`，主要采集真实 Linux 虚拟节点。WSL IP 会在 WSL 重启后变化，启动脚本会自动打印最新 IP。
