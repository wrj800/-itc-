# UML 工具使用说明

## 一、工具选择

本项目使用 PlantUML + Graphviz 作为 UML 图设计与导出工具。

| 工具 | 作用 |
|---|---|
| PlantUML | 编写和渲染 UML 图，包括用例图、类图、时序图、活动图、组件图、部署图、ER 图 |
| Graphviz | 为 PlantUML 提供布局能力，尤其用于类图、组件图、部署图、ER 图 |
| Java | 运行 `plantuml.jar` |

## 二、本机工具位置

```text
PlantUML: E:\Acodex\tools\plantuml.jar
Graphviz dot: C:\Program Files\Graphviz\bin\dot.exe
```

## 三、UML 源文件位置

正式设计目录：

```text
E:\.AA毕业设计\03_系统设计\UML
```

源码仓库同步目录：

```text
E:\.AA毕业设计\10_项目源码\docs\设计图\UML
```

## 四、导出图片位置

正式设计目录：

```text
E:\.AA毕业设计\03_系统设计\UML导出\PNG
E:\.AA毕业设计\03_系统设计\UML导出\SVG
```

源码仓库同步目录：

```text
E:\.AA毕业设计\10_项目源码\docs\设计图\导出图\PNG
E:\.AA毕业设计\10_项目源码\docs\设计图\导出图\SVG
```

## 五、导出命令

```powershell
$env:GRAPHVIZ_DOT='C:\Program Files\Graphviz\bin\dot.exe'
$umlDir='E:\.AA毕业设计\03_系统设计\UML'
$pumlFiles = Get-ChildItem -File $umlDir -Filter '*.puml' | ForEach-Object { $_.FullName }

java '-Dfile.encoding=UTF-8' "-DGRAPHVIZ_DOT=$env:GRAPHVIZ_DOT" `
  -jar 'E:\Acodex\tools\plantuml.jar' `
  -charset UTF-8 `
  -tpng `
  -o '..\UML导出\PNG' `
  @pumlFiles

java '-Dfile.encoding=UTF-8' "-DGRAPHVIZ_DOT=$env:GRAPHVIZ_DOT" `
  -jar 'E:\Acodex\tools\plantuml.jar' `
  -charset UTF-8 `
  -tsvg `
  -o '..\UML导出\SVG' `
  @pumlFiles
```

## 六、已导出的图

| 序号 | 文件 | 类型 |
|---:|---|---|
| 1 | `01_系统用例图` | 用例图 |
| 2 | `02_核心类图` | 类图 |
| 3 | `03_告警转工单时序图` | 时序图 |
| 4 | `04_RAG知识库问答时序图` | 时序图 |
| 5 | `05_工单处理活动图` | 活动图 |
| 6 | `06_系统组件图` | 组件图 |
| 7 | `07_系统部署图` | 部署图 |
| 8 | `08_虚拟设备采集时序图` | 时序图 |
| 9 | `09_虚拟实验拓扑图` | 拓扑图 |
| 10 | `10_原型页面导航图` | 页面导航图 |
| 11 | `11_监控采集活动图` | 活动图 |
| 12 | `12_AI故障诊断活动图` | 活动图 |
| 13 | `13_ER图` | ER 图 |
| 14 | `14_告警状态图` | 状态图 |
| 15 | `15_工单状态图` | 状态图 |

## 七、使用建议

1. 写论文或开题材料时优先使用 PNG。
2. 需要继续编辑或保持清晰度时使用 SVG。
3. 修改 `.puml` 源文件后，需要重新执行导出命令。
4. 导出后同步更新 `docs/设计图/导出图`，保证 GitHub 仓库中也保留图片版本。
