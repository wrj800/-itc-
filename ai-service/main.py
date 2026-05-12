from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="ICT Ops AI Service")


class DiagnoseRequest(BaseModel):
    question: str


@app.get("/health")
def health():
    return {"service": "ict-ops-ai-service", "status": "UP", "time": datetime.now().isoformat()}


@app.post("/diagnose")
def diagnose(payload: DiagnoseRequest):
    return {
        "possibleCauses": ["服务不可用", "资源使用率过高", "网络连通性异常"],
        "steps": ["查看监控指标", "检查服务端口", "分析日志关键字"],
        "suggestion": f"已收到故障描述：{payload.question}。建议先结合告警和日志进行定位。",
    }
