package com.graduation.ictops.ops;

import com.graduation.ictops.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/ops")
public class OpsController {
    private static final DateTimeFormatter ORDER_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final AtomicLong ticketSequence = new AtomicLong(1003);
    private final List<DeviceAsset> assets = new CopyOnWriteArrayList<>();
    private final List<MonitorTarget> targets = new CopyOnWriteArrayList<>();
    private final List<AlertEvent> alerts = new CopyOnWriteArrayList<>();
    private final List<WorkOrder> workOrders = new CopyOnWriteArrayList<>();

    public OpsController() {
        assets.addAll(List.of(
                new DeviceAsset("srv-wsl-01", "WSL Ubuntu 运维节点", "server", "WSL2 Ubuntu 24.04", "172.18.219.55", "online", "核心机房A", "node_exporter", OffsetDateTime.now().minusMinutes(6)),
                new DeviceAsset("srv-docker-01", "Docker Desktop 观测节点", "server", "Docker Desktop", "127.0.0.1", "online", "本机实验环境", "node_exporter", OffsetDateTime.now().minusMinutes(4)),
                new DeviceAsset("net-edge-01", "企业出口链路探测", "network", "Blackbox HTTP/TCP", "host.docker.internal", "warning", "边界网络", "blackbox_exporter", OffsetDateTime.now().minusMinutes(12)),
                new DeviceAsset("bmc-demo-01", "服务器 BMC 模拟对象", "bmc", "IPMI/iBMC Simulator", "192.168.56.20", "offline", "虚拟硬件池", "planned", OffsetDateTime.now().minusHours(2))
        ));

        targets.addAll(List.of(
                new MonitorTarget("prometheus", "Prometheus 服务", "http://127.0.0.1:9090/-/healthy", "docker", "UP", 21, OffsetDateTime.now().minusMinutes(1)),
                new MonitorTarget("redis", "Redis 缓存", "127.0.0.1:6379", "docker", "UP", 5, OffsetDateTime.now().minusMinutes(1)),
                new MonitorTarget("blackbox", "Blackbox Exporter", "http://127.0.0.1:9115", "docker", "UP", 18, OffsetDateTime.now().minusMinutes(1)),
                new MonitorTarget("wsl-node", "WSL node_exporter", "http://172.18.219.55:9100/metrics", "wsl", "UP", 31, OffsetDateTime.now().minusMinutes(1)),
                new MonitorTarget("backend-api", "Spring Boot 后端", "http://127.0.0.1:8080/api/health", "blackbox", "UP", 12, OffsetDateTime.now().minusMinutes(1))
        ));

        alerts.addAll(List.of(
                new AlertEvent("ALT-20260512-001", "net-edge-01", "出口链路 HTTP 探测抖动", "P2", "active", "blackbox_success", "最近 5 分钟 HTTP 探测成功率低于阈值，需要检查代理、DNS 或防火墙策略。", OffsetDateTime.now().minusMinutes(15)),
                new AlertEvent("ALT-20260512-002", "bmc-demo-01", "BMC 模拟对象离线", "P3", "active", "ipmi_up", "硬件管理链路未接入，当前作为后续 BMC/IPMI 仿真接入待办。", OffsetDateTime.now().minusHours(1)),
                new AlertEvent("ALT-20260512-003", "srv-wsl-01", "Linux 节点负载观察", "P4", "resolved", "node_load1", "WSL 节点一度出现负载升高，已恢复，保留为演示闭环数据。", OffsetDateTime.now().minusHours(3))
        ));

        workOrders.addAll(List.of(
                new WorkOrder("WO-20260512-1001", "ALT-20260512-001", "检查出口链路探测失败", "network", "processing", "张三", "检查 Blackbox 目标地址、DNS 与本机防火墙策略。", OffsetDateTime.now().minusMinutes(10))
        ));
    }

    @GetMapping("/overview")
    public ApiResponse<Overview> overview() {
        long onlineAssets = assets.stream().filter(asset -> "online".equals(asset.status())).count();
        long activeAlerts = alerts.stream().filter(alert -> "active".equals(alert.status())).count();
        long openOrders = workOrders.stream().filter(order -> !"closed".equals(order.status())).count();
        double availability = targets.isEmpty() ? 0 : targets.stream().filter(target -> "UP".equals(target.status())).count() * 100.0 / targets.size();
        return ApiResponse.ok(new Overview(
                assets.size(),
                onlineAssets,
                activeAlerts,
                openOrders,
                Math.round(availability * 10.0) / 10.0,
                OffsetDateTime.now()
        ));
    }

    @GetMapping("/assets")
    public ApiResponse<List<DeviceAsset>> assets() {
        return ApiResponse.ok(assets.stream()
                .sorted(Comparator.comparing(DeviceAsset::status).thenComparing(DeviceAsset::id))
                .toList());
    }

    @GetMapping("/targets")
    public ApiResponse<List<MonitorTarget>> targets() {
        return ApiResponse.ok(targets);
    }

    @GetMapping("/alerts")
    public ApiResponse<List<AlertEvent>> alerts() {
        return ApiResponse.ok(alerts.stream()
                .sorted(Comparator.comparing(AlertEvent::createdAt).reversed())
                .toList());
    }

    @PostMapping("/alerts/{alertId}/work-orders")
    public ApiResponse<WorkOrder> createWorkOrder(@PathVariable("alertId") String alertId, @Valid @RequestBody CreateWorkOrderRequest request) {
        AlertEvent alert = alerts.stream()
                .filter(item -> item.id().equals(alertId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("告警不存在: " + alertId));

        Optional<WorkOrder> existing = workOrders.stream()
                .filter(item -> item.alertId().equals(alertId))
                .findFirst();
        if (existing.isPresent()) {
            return ApiResponse.ok(existing.get());
        }

        String id = "WO-" + OffsetDateTime.now().format(ORDER_DATE_FORMATTER) + "-" + ticketSequence.incrementAndGet();
        WorkOrder order = new WorkOrder(
                id,
                alert.id(),
                request.title(),
                request.category(),
                "open",
                request.assignee(),
                "由告警转入，初始处置建议：" + alert.summary(),
                OffsetDateTime.now()
        );
        workOrders.add(order);
        alerts.remove(alert);
        alerts.add(alert.withStatus("processing"));
        return ApiResponse.ok(order);
    }

    @GetMapping("/work-orders")
    public ApiResponse<List<WorkOrder>> workOrders() {
        return ApiResponse.ok(workOrders.stream()
                .sorted(Comparator.comparing(WorkOrder::createdAt).reversed())
                .toList());
    }

    @PostMapping("/diagnose")
    public ApiResponse<DiagnosisResult> diagnose(@Valid @RequestBody DiagnoseRequest request) {
        String text = request.question().toLowerCase(Locale.ROOT);
        String severity = text.contains("down") || text.contains("离线") || text.contains("不可用") ? "P2" : "P3";
        List<String> causes = new ArrayList<>();
        List<String> actions = new ArrayList<>();

        if (text.contains("blackbox") || text.contains("链路") || text.contains("网络")) {
            causes.add("Blackbox 探测目标不可达或响应码异常");
            causes.add("本机防火墙、代理、DNS 或端口转发策略变更");
            actions.add("在 Prometheus 中查询 blackbox_success 和 probe_http_status_code");
            actions.add("从宿主机直接访问目标 URL，确认是否为网络层问题");
            actions.add("检查 deploy/blackbox.yml 与 prometheus.yml 的探测目标是否一致");
        } else if (text.contains("linux") || text.contains("wsl") || text.contains("node")) {
            causes.add("WSL IP 变化导致 Prometheus 采集地址失效");
            causes.add("node_exporter 未启动或 9100 端口不可达");
            actions.add("执行 scripts/check-wsl-real-node.ps1 检查 WSL 采集链路");
            actions.add("重新执行 scripts/start-wsl-real-node.ps1 刷新 WSL Prometheus 配置");
        } else {
            causes.add("服务进程未启动或健康检查失败");
            causes.add("监控目标配置与实际监听地址不一致");
            actions.add("先检查 /api/health、Prometheus Targets 和 Docker 容器状态");
            actions.add("将异常指标、告警和日志合并到工单备注中再处理");
        }

        String conclusion = "初步判断为" + severity + "级运维事件，建议先验证采集链路，再定位业务服务或网络策略。";
        return ApiResponse.ok(new DiagnosisResult(severity, causes, actions, conclusion, OffsetDateTime.now()));
    }

    public record Overview(
            int totalAssets,
            long onlineAssets,
            long activeAlerts,
            long openWorkOrders,
            double targetAvailability,
            OffsetDateTime refreshedAt
    ) {
    }

    public record DeviceAsset(
            String id,
            String name,
            String type,
            String model,
            String address,
            String status,
            String location,
            String collector,
            OffsetDateTime lastSeen
    ) {
    }

    public record MonitorTarget(
            String id,
            String name,
            String endpoint,
            String source,
            String status,
            int latencyMs,
            OffsetDateTime lastScrape
    ) {
    }

    public record AlertEvent(
            String id,
            String assetId,
            String title,
            String severity,
            String status,
            String metric,
            String summary,
            OffsetDateTime createdAt
    ) {
        public AlertEvent withStatus(String nextStatus) {
            return new AlertEvent(id, assetId, title, severity, nextStatus, metric, summary, createdAt);
        }
    }

    public record WorkOrder(
            String id,
            String alertId,
            String title,
            String category,
            String status,
            String assignee,
            String description,
            OffsetDateTime createdAt
    ) {
    }

    public record CreateWorkOrderRequest(
            @NotBlank(message = "工单标题不能为空")
            String title,
            @NotBlank(message = "工单分类不能为空")
            String category,
            @NotBlank(message = "处理人不能为空")
            String assignee
    ) {
    }

    public record DiagnoseRequest(
            @NotBlank(message = "诊断问题不能为空")
            String question
    ) {
    }

    public record DiagnosisResult(
            String severity,
            List<String> possibleCauses,
            List<String> recommendedActions,
            String conclusion,
            OffsetDateTime generatedAt
    ) {
    }
}
