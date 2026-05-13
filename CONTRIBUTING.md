# 贡献与开发说明

本文档用于约束本项目后续开发流程。即使当前主要由我个人完成，也按成熟开源项目方式管理，方便后续答辩、实习展示和 AI 接手。

## 开发前

1. 先阅读 `README.md`、`docs/开发规则与AI接手规范.md`、`docs/开发文档.md`。
2. 确认当前分支和工作区状态：

```powershell
git status --short
```

3. 明确本次改动属于前端、后端、AI 服务、数据库、部署、文档中的哪一类。

## 开发顺序

1. 先确认设计和接口。
2. 再修改代码。
3. 同步更新文档。
4. 执行验证命令。
5. 更新开发记录。
6. 提交并推送。

## 提交规范

提交信息使用类似 Conventional Commits 的格式：

```text
feat: add work order status transition
fix: handle prometheus timeout
docs: update startup guide
style: polish maintainer dashboard
test: add ops controller tests
chore: add ci workflow
```

常用类型：

| 类型 | 含义 |
|---|---|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档 |
| `style` | UI 或格式调整 |
| `refactor` | 重构 |
| `test` | 测试 |
| `chore` | 工程配置、依赖、脚本 |

## 验证要求

后端改动至少执行：

```powershell
. .\set-env.ps1
mvn -q test
```

前端改动至少执行：

```powershell
cd frontend
npm run build
```

涉及页面视觉时，还需要重新导出或检查截图。

涉及接口时，需要记录真实请求结果，例如：

```text
GET /api/health -> 200
GET /api/ops/overview -> 200
POST /api/ops/diagnose -> 200
```

## 文档要求

每次开发后必须按实际影响更新：

```text
docs/开发文档.md
docs/开发记录.md
docs/开发过程记录.md
docs/设计图索引.md
```

新增环境变量、接口、数据库表、启动方式时，必须同步更新对应专项文档。

## PR 检查项

提交前至少自查：

1. 是否引入新旧版本共存文件。
2. 是否更新了开发记录。
3. 是否执行并记录验证命令。
4. 是否影响启动说明。
5. 是否影响 UML、ER 图、接口文档。
6. 是否有未提交文件。

## 不接受的改动

1. 只改页面但不更新文档。
2. 新增接口但不写接口说明。
3. 复制出 `最终版`、`新版`、`备份` 文件。
4. 没有验证就写“已完成”。
5. 把密钥、Token、真实账号密码提交到仓库。
