import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getSetting, setSetting } from '../../services/storage';

export default function ApiSettingsScreen() {
  const router = useRouter();
  const [zhipuKey, setZhipuKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const zhipu = await getSetting('zhipu_api_key');
    if (zhipu) setZhipuKey(zhipu);
    const hideState = await getSetting('api_key_hidden');
    setShowKey(hideState !== 'true');
  };

  const handleToggleShow = async () => {
    const newShowState = !showKey;
    setShowKey(newShowState);
    await setSetting('api_key_hidden', newShowState ? 'false' : 'true');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (zhipuKey) {
        await setSetting('zhipu_api_key', zhipuKey);
      }
      Alert.alert('成功', 'API 配置已保存', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('错误', '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>天气信息</Text>
        <Text style={styles.description}>
          天气数据由 Open-Meteo 免费 API 提供，无需配置，自动根据 GPS 位置获取实时天气。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>智谱 AI API</Text>
        <Text style={styles.description}>
          用于 AI 鱼类识别（GLM-4V-Flash 免费模型）。免费注册：open.bigmodel.cn
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="输入智谱 AI API Key"
            value={zhipuKey}
            onChangeText={setZhipuKey}
            placeholderTextColor="#ccc"
            autoCapitalize="none"
            secureTextEntry={!showKey}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={handleToggleShow}>
            <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>说明</Text>
        <Text style={styles.infoText}>
          • 天气数据：使用 Open-Meteo 免费 API，自动根据位置获取{'\n'}
          • 智谱 AI：不配置则使用随机模拟识别{'\n'}
          • 所有 API Key 仅存储在本地设备
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? '保存中...' : '保存配置'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  description: { fontSize: 14, color: '#95a5a6', marginBottom: 12, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eyeIcon: { fontSize: 20 },
  infoSection: {
    padding: 16,
    backgroundColor: '#eaf2f8',
    margin: 16,
    borderRadius: 12,
  },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#1a5276', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#2c3e50', lineHeight: 22 },
  saveBtn: {
    margin: 16,
    backgroundColor: '#1a5276',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});