# 🎣 钓鱼人宝典 v1.2.0

**v1.0.0 → v1.2.0 — 更稳定、更个性、更好用**

---

## ✨ 新增功能

### ⚙ 单位偏好设置
- 新增「单位偏好」页面（我的 → 单位偏好）
- 支持 cm / inch、kg / lb、°C / °F 三组单位自由切换
- 全局生效：首页天气卡片、鱼种详情、钓获记录、钓获详情等所有页面

### 🚨 全局错误边界 (ErrorBoundary)
- 根布局新增 ErrorBoundary 组件
- 渲染异常时显示友好错误页面 + 重试按钮，不再白屏崩溃

### 📦 新增 .env.example
- 提供 API Key 配置模板，方便开发者快速上手

## 🔧 问题修复

- **鱼种详情页「记录钓获」**：修复点击后不自动填入鱼种的问题，现在自动传参
- **记录 ID 冲突**：修复极端情况下同一毫秒创建两条记录导致主键冲突
- **分享功能重复代码**：钓获详情页改为复用 utils/share 工具函数
- **useCallback 依赖**：修复首页、记录、图鉴、个人中心 4 个页面的 React Hooks 依赖数组不完整
- **useWeather 卸载后更新**：修复天气 Hook 在组件卸载后仍尝试更新 state 的警告
- **weather.ts 空 catch**：补全天气缓存预热的空 catch 块注释
- **fish/[id].tsx Rules of Hooks**：修复 useUnits 在条件 return 之后调用的违规
- **未使用 import**：移除 FishSpecies 等未使用的类型导入
- **未使用 styles**：清理首页 7 个已废弃的 StyleSheet 条目

## 🔥 工程改进

- **API Key 文档**：crypto.ts 注释更新，明确天气 Key 内置 / 智谱 Key 用户自配
- **.gitignore 重写**：排除 .apk / .aab 构建产物、.env 敏感文件、IDE 配置
- **react-native-web**：版本从 ^0.21.0 对齐为 ~0.20.0，兼容 RN 0.81
- **新增 useUnits Hook**：统一的单位偏好管理，从 SQLite 读取设置并提供格式化函数

## 📦 涉及文件

```
新增:
  components/ErrorBoundary.tsx
  hooks/useUnits.ts
  .env.example

修改:
  app/_layout.tsx              (ErrorBoundary 包裹)
  app/fish/[id].tsx            (传参 + 单位 + Hooks 修复)
  app/catch/new.tsx            (ID 生成修复)
  app/catch/[id].tsx           (share 复用 + 单位)
  app/(tabs)/index.tsx         (useCallback + 单位 + 清理 styles)
  app/(tabs)/records.tsx       (useCallback + 单位)
  app/(tabs)/encyclopedia.tsx  (useCallback + 单位)
  app/(tabs)/profile.tsx       (useCallback)
  hooks/useWeather.ts          (useCallback 重构)
  components/WeatherCard.tsx   (单位支持)
  services/weather.ts          (空 catch 修复)
  utils/crypto.ts              (文档更新)
  package.json                 (react-native-web 版本)
  .gitignore                   (重写)
  README.md                    (全面更新)
```

---

**Full Changelog**: https://github.com/sakura-love/fishing-app/compare/v1.0.0...v1.2.0
