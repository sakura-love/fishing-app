import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎣</Text>
        <Text style={styles.appName}>钓鱼人宝典</Text>
        <Text style={styles.version}>版本 {version}</Text>
        <Text style={styles.slogan}>你的智能钓鱼助手</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>功能特色</Text>
        <View style={styles.card}>
          <Text style={styles.featureItem}>🌤️ 实时天气与智能水温估算</Text>
          <Text style={styles.featureItem}>🐟 40+ 种常见鱼种图鉴</Text>
          <Text style={styles.featureItem}>📝 钓获记录与成就系统</Text>
          <Text style={styles.featureItem}>🤖 AI 鱼类智能识别</Text>
          <Text style={styles.featureItem}>📊 钓鱼数据统计</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>技术栈</Text>
        <View style={styles.card}>
          <Text style={styles.techItem}>React Native 0.81 + Expo SDK 54</Text>
          <Text style={styles.techItem}>TypeScript 5.9</Text>
          <Text style={styles.techItem}>SQLite 本地数据库</Text>
          <Text style={styles.techItem}>和风天气 API</Text>
          <Text style={styles.techItem}>智谱 AI GLM-4V 视觉识别</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>开源协议</Text>
        <View style={styles.card}>
          <Text style={styles.licenseText}>
            本项目基于 CC BY-NC-SA 4.0 许可证开源
          </Text>
          <Text style={styles.licenseDetail}>✅ 允许：分享、改编、非商业使用</Text>
          <Text style={styles.licenseDetail}>❌ 禁止：商业用途</Text>
          <Text style={styles.licenseDetail}>📋 要求：注明出处、相同方式共享</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于开发者</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            专为钓鱼爱好者打造的移动应用，集天气查询、鱼种图鉴、钓获记录和 AI 识别于一体。
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for fishing enthusiasts</Text>
        <Text style={styles.copyright}>© 2025 钓鱼人宝典</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  header: {
    backgroundColor: '#1a5276',
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: { fontSize: 64 },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  version: { fontSize: 14, color: '#aed6f1', marginTop: 4 },
  slogan: { fontSize: 16, color: '#aed6f1', marginTop: 8 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureItem: { fontSize: 15, color: '#2c3e50', lineHeight: 30 },
  techItem: { fontSize: 14, color: '#5d6d7e', lineHeight: 26 },
  licenseText: { fontSize: 15, color: '#2c3e50', marginBottom: 8 },
  licenseDetail: { fontSize: 14, color: '#5d6d7e', lineHeight: 26 },
  aboutText: { fontSize: 15, color: '#2c3e50', lineHeight: 24 },
  footer: { alignItems: 'center', padding: 32 },
  footerText: { fontSize: 14, color: '#95a5a6' },
  copyright: { fontSize: 12, color: '#bdc3c7', marginTop: 4 },
});