# FlyVista Brain Atlas（果蝇脑景）

FlyVista 是一个可离线使用的成年果蝇全脑功能分区可视化软件。它在浏览器或桌面窗口中展示 78 个 FlyWire/JFRC2 神经毡模型，并按六类主要功能系统着色。

> 当前版本：`0.1.0-alpha.0`。GitHub Release 目前仅提供 macOS Apple Silicon 版本；Intel Mac 和 Windows 版本将在完成实机验证后发布。

## 主要功能

- 三维查看、旋转和缩放成年果蝇全脑
- 单独显示或隐藏六类功能分区
- 点击神经毡查看中英文名称、半球位置和功能说明
- 正面、顶面和侧面标准视角
- 中文和英文界面
- 所有脑区模型随应用打包，运行时不依赖网络或其他本地项目

## 普通用户

GitHub 仓库建立并发布首个 Release 后，用户可在 Releases 页面下载：

- macOS Apple Silicon：DMG 安装映像

Alpha 阶段的安装包使用临时签名且尚未完成 Apple 公证，macOS Gatekeeper 可能显示安全提示。正式公开推广前应完成 Developer ID 签名和 macOS 公证。

## 开发环境

- Node.js 22.13 或更高版本
- pnpm 11
- Rust 1.98（由 `rust-toolchain.toml` 固定）
- macOS 桌面构建需要 Xcode Command Line Tools
- Windows 桌面构建需要 Microsoft C++ Build Tools 和 WebView2

安装依赖：

```bash
pnpm install --frozen-lockfile
```

运行 Web 开发版：

```bash
pnpm dev
```

运行桌面开发版：

```bash
pnpm desktop:dev
```

执行完整检查：

```bash
pnpm check
cargo check --manifest-path src-tauri/Cargo.toml
```

构建当前平台的桌面安装包：

```bash
pnpm desktop:build
```

## 项目结构

- `src/`：React 页面、Three.js 交互、功能分区和脑区说明
- `public/neuropils/`：随程序发布的 78 个 PLY 神经毡模型
- `src-tauri/`：macOS 和 Windows 桌面程序配置
- `tests/`：脑区数据完整性测试
- `.github/workflows/`：持续集成和跨平台发布流程
- `docs/`：架构、平台测试和发布检查清单

## 授权与引用

- 程序源码：Apache License 2.0，见 [LICENSE](LICENSE)
- 脑区模型：遵循 FlyWire 公共数据的 CC BY-NC 4.0 条款，见 [DATA_LICENSE.md](DATA_LICENSE.md)
- 学术引用：见 [CITATION.cff](CITATION.cff)

FlyWire 数据的非商业限制意味着包含这些模型的发行版并非不受限制地允许商业使用。商业发行前必须另行确认数据授权。

## 参与开发

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)、[SECURITY.md](SECURITY.md) 和 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

所有运行时所需的源码、文字信息和三维模型都位于本项目内部。FlyVista 不读取 DigitalFlyV3、BrainEmbodiedPlatform、BrainEmbodiedStudio 或其他本地项目中的文件。
