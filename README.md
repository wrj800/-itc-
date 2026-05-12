# ICT 智能运维平台源码目录

本目录存放毕业设计项目代码与本机运行环境脚本。

```text
10_项目源码
├── backend       Spring Boot 后端项目
├── frontend      Vue 3 前端项目
├── ai-service    Python FastAPI AI 服务
├── database      数据库脚本和初始化数据
├── deploy        Docker Compose、Prometheus、Blackbox 配置
├── scripts       本机启动与检查脚本
└── docs          运行说明和接口说明
```

## 推荐启动顺序

1. 启动 Docker Desktop。
2. 启动 Docker 观测栈：Redis、Prometheus、Blackbox Exporter、Docker node_exporter。
3. 启动 WSL Ubuntu 真实 Linux 节点采集链路。
4. 启动 AI 服务。
5. 启动 Spring Boot 后端。
6. 启动 Vue 3 前端。

详细命令见：

```text
docs/环境启动说明.md
docs/环境配置完成记录.md
deploy/wsl-real-node.md
```

## 当前已完成

1. 固定 `JDK17` 与 `Maven 3.9.9`。
2. Docker 观测栈可用。
3. WSL Ubuntu 真实 Linux 节点可被 Prometheus 采集。
4. 后端支持 `docker` 与 `wsl` 两个 Prometheus 数据源。
5. 前端可展示 Docker 观测目标与 WSL Linux 主机信息。
