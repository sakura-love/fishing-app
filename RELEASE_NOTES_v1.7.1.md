# 🎣 钓鱼人宝典 v1.7.1

**v1.7.0 → v1.7.1 — 修复 GPS 定位问题**

---

## 🔧 问题修复

### GPS 定位修复
- **强制使用 GPS 定位**：启用 `enableHighAccuracy: true`，避免 Android 在 WiFi 环境下优先走 WiFi 定位导致卡住或超时
- **提升定位精度**：从 `Accuracy.Low`（~3 公里，市级）提升到 `Accuracy.Balanced`（~100 米，区/县级），天气查询更准确
- **简化定位流程**：移除不稳定的 `getCurrentPositionAsync`，统一使用 `watchPositionAsync`，减少设备兼容性问题

### 问题背景
部分 Android 设备在连接 WiFi 时，系统会优先尝试通过 WiFi 路由器进行网络定位。当 WiFi 网络的位置数据库无法匹配时（如公司网络、VPN 等），定位会卡住很久甚至不返回，导致 App 显示「暂时无法获取位置」。断开 WiFi 后反而能正常定位。本版本通过强制 GPS 定位彻底解决此问题。

---

## 📦 涉及文件

```
修改:
  hooks/useWeather.ts          (GPS 定位逻辑重构)
  app.json                     (版本号)
  android/app/build.gradle     (版本号)
```

---

**Full Changelog**: https://github.com/sakura-love/fishing-app/compare/v1.7.0...v1.7.1
