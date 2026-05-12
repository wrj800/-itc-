package com.graduation.ictops.monitor;

import com.graduation.ictops.common.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/monitor/prometheus")
public class PrometheusController {
    private final Map<String, String> sources;

    public PrometheusController(
            @Value("${ict.prometheus.base-url:http://127.0.0.1:9090}") String dockerBaseUrl,
            @Value("${ict.prometheus.wsl-base-url:http://127.0.0.1:19090}") String wslBaseUrl
    ) {
        this.sources = Map.of(
                "docker", dockerBaseUrl,
                "wsl", wslBaseUrl
        );
    }

    @GetMapping("/query")
    public ApiResponse<Map<String, Object>> query(
            @RequestParam(name = "source", defaultValue = "docker") String source,
            @RequestParam(name = "query", defaultValue = "up") String query
    ) {
        String baseUrl = resolveSource(source);
        String result = RestClient.builder().baseUrl(baseUrl).build().get()
                .uri(uriBuilder -> uriBuilder.path("/api/v1/query").queryParam("query", query).build())
                .retrieve()
                .body(String.class);
        return ApiResponse.ok(Map.of(
                "source", source,
                "baseUrl", baseUrl,
                "query", query,
                "time", OffsetDateTime.now().toString(),
                "raw", result == null ? "" : result
        ));
    }

    @GetMapping("/targets")
    public ApiResponse<Map<String, Object>> targets(@RequestParam(name = "source", defaultValue = "docker") String source) {
        String baseUrl = resolveSource(source);
        String result = RestClient.builder().baseUrl(baseUrl).build().get()
                .uri("/api/v1/targets?state=active")
                .retrieve()
                .body(String.class);
        return ApiResponse.ok(Map.of(
                "source", source,
                "baseUrl", baseUrl,
                "raw", result == null ? "" : result
        ));
    }

    @GetMapping("/sources")
    public ApiResponse<Map<String, String>> sources() {
        return ApiResponse.ok(sources);
    }

    private String resolveSource(String source) {
        if (!sources.containsKey(source)) {
            throw new IllegalArgumentException("Unsupported Prometheus source: " + source);
        }
        return sources.get(source);
    }
}
