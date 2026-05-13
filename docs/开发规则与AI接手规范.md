# 开发规则与 AI 接手规范

本文档是项目后续开发的硬性规范，用于保证我自己继续开发、或由 AI/其他开发者接手时，都能快速理解项目现状，并避免文档、设计图、代码出现多版本混乱。

## 一、最高原则

1. 先设计，再实现；先验证，再提交。
2. 除 `docs/开发过程记录.md` 外，任何设计文档、接口文档、配置说明、UML 图都不允许新旧版本共存。
3. 详细开发过程、问题定位、方案调整，只能写入 `docs/开发过程记录.md`；`docs/开发记录.md` 只保留变更摘要和验证结果。
4. 所有当前有效说明，只保留在对应的唯一最新版文件中。
5. 每次修改代码、环境、接口、数据库、设计图，都必须同步更新相关文档。
6. 每次完成一个阶段，都必须提交 Git 并推送远程仓库。
7. 每次完成任务后，必须进行复盘检查，并给出建议执行的下一步。

## 二、AI 接手前必须先阅读的文件

AI 或新开发者接手时，必须按顺序阅读：

```text
README.md
docs/开发规则与AI接手规范.md
docs/开发文档.md
docs/开发记录.md
docs/开发过程记录.md
docs/设计图索引.md
docs/优秀项目对标与改进方案.md
docs/运维平台UI设计规范.md
docs/环境启动说明.md
docs/环境配置完成记录.md
deploy/wsl-real-node.md
CONTRIBUTING.md
```

如果要继续做设计图，还必须阅读：

```text
docs/UML工具使用说明.md
docs/设计图/原型与流程设计说明书.md
docs/设计图/页面线框图.md
docs/设计图/UML/
```

## 三、文档维护规则

### 3.1 当前有效文档

| 文档 | 作用 |
|---|---|
| `README.md` | 项目概览、启动入口、当前能力 |
| `docs/开发规则与AI接手规范.md` | 后续开发硬性规则 |
| `docs/开发文档.md` | 当前架构、模块、接口、数据源 |
| `docs/开发记录.md` | 每次变更摘要、涉及文件、验证结果 |
| `docs/开发过程记录.md` | 阶段推进、问题定位、方案调整、历史过程 |
| `docs/设计图索引.md` | 当前设计图清单和导出位置 |
| `docs/优秀项目对标与改进方案.md` | 对标优秀开源项目后的质量标准和改进路线 |
| `docs/运维平台UI设计规范.md` | 运维平台页面布局、组件、视觉和截图验收规则 |
| `docs/UML工具使用说明.md` | UML 工具、导出命令和图片生成规则 |
| `docs/环境启动说明.md` | 本机启动步骤 |
| `docs/环境配置完成记录.md` | 已完成环境配置和验证证据 |
| `CONTRIBUTING.md` | 提交规范、验证规则和 PR 自检要求 |

### 3.2 禁止行为

禁止出现以下文件命名：

```text
xxx_新版.md
xxx_旧版.md
xxx_备份.md
xxx_copy.md
xxx_v1.md
xxx_v2.md
xxx_最终版.md
xxx_最终修改版.md
```

如果确实需要记录详细历史变化，只写入：

```text
docs/开发过程记录.md
```

`docs/开发记录.md` 可以保留“删除了什么、合并到哪里、验证结果是什么”的简短摘要，但不能复制保留旧内容全文。

### 3.3 删除或合并文档时的要求

如果删除、合并或重命名文档，必须同时检查：

1. `README.md` 是否仍引用旧文件。
2. `docs/开发文档.md` 是否仍引用旧文件。
3. `docs/设计图索引.md` 是否仍引用旧文件。
4. `docs/UML工具使用说明.md` 是否仍引用旧文件。
5. Git 仓库中是否仍保留旧文件。

检查命令：

```powershell
git grep "旧文件名"
git status --short
```

## 四、开发记录规则

每次开发完成后，必须更新：

```text
docs/开发记录.md
```

记录格式：

```text
### 本次开发主题

完成内容：
1. ...
2. ...

涉及文件：
```text
path/to/file
```

验证方式：
```powershell
实际执行过的命令
```

验证结果：
```text
真实结果，不写空话
```

遗留问题：
1. ...

下一步建议：
1. ...
```

要求：

1. 记录必须以我的视角或项目视角编写，不写“用户要求”“助手完成”。
2. 必须写真实验证结果。
3. 如果命令没有启动，要写“命令未启动”；如果命令启动后失败，要写具体失败原因。
4. 不允许只写“已完成”但没有验证证据。
5. 必须写“下一步建议”，说明后续最应该做什么，以及为什么。

## 五、开发过程记录规则

以下内容必须写入：

```text
docs/开发过程记录.md
```

1. 阶段目标变化。
2. 技术选型原因。
3. 遇到的问题和定位过程。
4. 被否定的方案和原因。
5. 设计顺序调整。
6. 环境问题和解决过程。
7. 重要的开发决策。

写法要求：

1. 使用我的视角，例如“我将……”“本阶段我……”“我发现……”。
2. 不使用“用户”“助手”“AI 帮我”等旁观者口吻。
3. 可以记录历史过程，但不能让旧文件继续留在项目中。

## 六、设计图维护规则

### 6.1 唯一设计源

UML 源文件只维护在：

```text
docs/设计图/UML/
```

正式设计目录同步位置：

```text
E:\.AA毕业设计\03_系统设计\UML
```

页面和流程设计只维护在：

```text
docs/设计图/原型与流程设计说明书.md
docs/设计图/页面线框图.md
```

### 6.2 导出规则

每次修改 `.puml` 后，必须：

1. 清空旧 PNG/SVG。
2. 重新导出全量图片。
3. 确认 PNG 数量 = SVG 数量 = PUML 数量。
4. 更新 `docs/设计图索引.md`。
5. 更新 `docs/开发记录.md`。

当前导出工具：

```text
PlantUML + Graphviz
```

当前应有数量：

```text
15 个 .puml
15 张 PNG
15 张 SVG
```

### 6.3 设计图质量标准

设计图必须满足：

1. 用例图表达角色和核心能力，不堆过多细节。
2. 类图按领域分包，体现实体关系和关键枚举。
3. ER 图必须包含主键、外键和核心业务表。
4. 时序图必须体现前端、Controller、Service、数据库或外部服务边界。
5. 活动图必须体现判断节点和状态流转。
6. 部署图必须和当前真实环境一致。
7. 状态图必须用于告警、工单等有生命周期的对象。

## 七、代码开发规则

### 7.1 开发顺序

后续功能开发按以下顺序推进：

1. 确认设计图。
2. 更新数据库设计。
3. 定义接口。
4. 实现后端。
5. 实现前端。
6. 联调真实环境。
7. 更新文档。
8. 提交并推送。

### 7.2 后端规则

1. 使用 Spring Boot 3 + JDK 17。
2. Controller 参数必须显式写 `@RequestParam(name = "...")`，避免反射参数名问题。
3. 外部服务地址必须放入配置文件，不写死在业务代码中。
4. Prometheus 查询接口必须保留 `source=docker|wsl` 数据源边界。
5. 新增接口必须更新 `docs/开发文档.md`。

### 7.3 前端规则

1. 使用 Vue 3 + TypeScript + Element Plus。
2. 页面先按设计图实现，不随意新增设计图之外的模块。
3. 运维系统界面以工作台为主，不做营销式首页。
4. 所有页面必须兼顾 1366px 桌面和移动窄屏基本可用。
5. 登录页已拆分到 `frontend/src/components/LoginView.vue`，后续接真实认证、JWT 和登录校验时优先改该组件，不要把登录表单重新堆回 `App.vue`。
6. 顶部工具栏和页面动作按钮必须保持文字单行显示，不能出现“刷新”“导出报表”等短按钮上下断行。
7. 页面组件已经从 `App.vue` 拆到 `frontend/src/components/admin/*`、`frontend/src/components/maintainer/*` 和 `frontend/src/components/common/render.ts`，后续不要把管理员页面、维护人员页面、KPI、表格、看板等大段渲染逻辑重新塞回 `App.vue`。
8. `App.vue` 的职责控制在应用外壳、登录态、导航状态、接口编排和页面挂载；新增业务页面应优先新建独立组件或页面文件。
9. 前端业务类型统一维护在 `frontend/src/types/ops.ts`，新增接口字段或页面数据结构时先补类型，再改组件。
10. 后端不可用时，前端允许保留演示数据兜底，保证截图和答辩演示不白屏；但真实接口接通后必须优先使用后端数据，并在文档中说明兜底边界。
11. 前端新增页面后必须执行：

```powershell
cd E:\.AA毕业设计\10_项目源码\frontend
npm run build
```

### 7.4 环境规则

1. Docker 观测栈必须通过 `deploy/start-observability.ps1` 启动。
2. WSL 真实节点必须通过 `scripts/start-wsl-real-node.ps1` 启动。
3. 后端启动脚本必须自动识别 WSL IP。
4. 不能把 `.venv`、`node_modules`、`target`、日志文件提交到仓库。

## 八、优秀项目工程化规则

### 8.1 对标原则

后续开发参考优秀开源项目时，只吸收能落地到本项目的内容，不为了显得复杂而堆技术。当前对标方向：

1. Spring PetClinic：学习小而完整的 Spring Boot 领域模型、测试和运行说明。
2. JHipster：学习前后端分离、权限、Docker、CI、OpenAPI 和工程完整度。
3. Vue Vben Admin / SoybeanAdmin：学习 Vue 3 后台的布局、路由、权限菜单和组件化。
4. Prometheus 官方实践：学习监控目标、告警规则和可观测性闭环。
5. GitHub Open Source Guides：学习 README、贡献说明、Issue/PR 模板和协作流程。

详细路线维护在：

```text
docs/优秀项目对标与改进方案.md
```

### 8.2 CI 规则

仓库必须保留 GitHub Actions CI：

```text
.github/workflows/ci.yml
```

当前 CI 至少验证：

```text
mvn -q test
cd frontend && npm ci && npm run build
```

如果后续新增 Python AI 服务测试、Docker Compose 验证、前端单元测试，需要继续扩展同一个 CI 工作流，不新建多个含义重复的旧版工作流。

### 8.3 Issue 和 PR 规则

仓库必须保留：

```text
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/feature_request.md
.github/pull_request_template.md
CONTRIBUTING.md
```

后续如果调整模板，只在原文件中更新，不创建 `模板新版`、`模板最终版` 等文件。

### 8.4 提交信息规则

提交信息使用类似 Conventional Commits 的格式：

```text
feat: add login permission model
fix: handle prometheus query timeout
docs: update database design
style: polish admin dashboard
test: add controller tests
chore: add ci workflow
```

每次提交前必须确保 `docs/开发记录.md` 已写入真实验证结果和下一步建议。

### 8.5 UI 设计规则

所有前端页面必须遵守：

```text
docs/运维平台UI设计规范.md
```

涉及 UI 的改动必须至少检查登录分流页、管理员后台、维护人员工作台三张 1600x900 截图。检查重点：

1. 不出现文字竖排、截断和按钮挤压。
2. 不出现角色权限混淆。
3. 首屏必须展示真实业务状态和可操作入口。
4. 管理员端偏全局治理，维护人员端偏接单处置。
5. KPI、表格、告警、工单、AI 诊断组件必须符合规范中的组件规则。

## 九、验证规则

每次开发至少执行与改动相关的验证。

常用命令：

```powershell
cd E:\.AA毕业设计\10_项目源码
powershell -ExecutionPolicy Bypass -File .\scripts\check-wsl-real-node.ps1

cd E:\.AA毕业设计\10_项目源码
.\set-env.ps1
mvn -pl backend -DskipTests package

cd E:\.AA毕业设计\10_项目源码\frontend
npm run build
```

接口验证示例：

```powershell
curl.exe -s http://127.0.0.1:8080/api/health
curl.exe -s "http://127.0.0.1:8080/api/monitor/prometheus/query?source=wsl&query=up"
```

## 十、Git 提交规则

每次阶段完成后必须：

```powershell
git status --short
git add -A
git commit -m "type: message"
git push
```

提交类型建议：

| 类型 | 用途 |
|---|---|
| `docs:` | 文档、设计图、过程记录 |
| `feat:` | 新功能 |
| `fix:` | 修复问题 |
| `chore:` | 工具、脚本、配置 |
| `test:` | 测试相关 |

提交前必须确认：

1. 没有误提交依赖和运行产物。
2. 文档引用没有指向已删除文件。
3. 设计图没有旧导出残留。
4. 工作区变更符合本次任务范围。

## 十一、完成后复盘规则

每次任务完成后，必须进行一次复盘检查。

复盘检查至少包括：

1. 本次目标是否完成。
2. 是否执行了必要验证。
3. 是否更新了开发记录和过程记录。
4. 是否存在新旧文件共存。
5. 是否存在 README 或索引指向已删除文件。
6. 是否需要同步 UML 导出图。
7. Git 是否已提交并推送。

最终回复或阶段总结必须包含：

```text
已完成：
验证：
风险或遗留：
建议下一步：
```

下一步建议必须具体可执行，例如：

```text
建议下一步：根据 ER 图和页面线框图，先实现设备资产模块的数据库表和后端 CRUD 接口。
```

## 十二、接手检查清单

AI 或开发者接手后，先执行：

```powershell
cd E:\.AA毕业设计\10_项目源码
git status --short --branch
git pull
```

然后检查：

1. 当前分支是否为 `main`。
2. 是否存在未提交改动。
3. `docs/开发过程记录.md` 最近阶段写到哪里。
4. `docs/开发记录.md` 最近一次完成了什么。
5. `docs/设计图索引.md` 中设计图数量是否和目录一致。
6. 需要开发的功能是否已有设计图和接口说明。

如果发现文档和代码不一致，先更新文档和记录，再继续编码。
