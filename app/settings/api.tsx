import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getSetting, setSetting, getAllSettings } from '../../services/storage';

export default function ApiSettingsScreen() {
  const router = useRouter();
  const [zhipuKey, setZhipuKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const zhipu = await getSetting('zhipu_api_key');
      console.log('[API Settings] Loaded zhipu_api_key:', zhipu ? `${zhipu.substring(0, 8)}...` : 'null');
      if (zhipu) setZhipuKey(zhipu);

      const hideState = await getSetting('api_key_hidden');
      console.log('[API Settings] Loaded api_key_hidden:', hideState);
      setShowKey(hideState !== 'true');
    } catch (error) {
      console.error('[API Settings] Load error:', error);
      setDebugInfo('加载设置失败: ' + String(error));
    }
  };

  const handleToggleShow = async () => {
    const newShowState = !showKey;
    setShowKey(newShowState);
    const success = await setSetting('api_key_hidden', newShowState ? 'false' : 'true');
    console.log('[API Settings] Toggle show key:', newShowState, 'saved:', success);
  };

  const handleSave = async () => {
    const trimmedKey = zhipuKey.trim();
    if (!trimmedKey) {
      Alert.alert('提示', '请输入 API Key');
      return;
    }

    setSaving(true);
    try {
      console.log('[API Settings] Saving zhipu_api_key:', `${trimmedKey.substring(0, 8)}...`);
      const success = await setSetting('zhipu_api_key', trimmedKey);
      console.log('[API Settings] Save result:', success);

      if (success) {
        // 再次验证
        const verifyKey = await getSetting('zhipu_api_key');
        if (verifyKey === trimmedKey) {
          setZhipuKey(trimmedKey);
          Alert.alert('✅ 保存成功', `API Key 已保存并验证成功\n\nKey: ${trimmedKey.substring(0, 8)}...${trimmedKey.substring(trimmedKey.length - 4)}`, [
            { text: '确定', onPress: () => router.back() },
          ]);
        } else {
          Alert.alert('⚠️ 验证失败', '保存后读取不一致，请重试');
        }
      } else {
        Alert.alert('❌ 保存失败', '写入数据库失败，请重试');
      }
    } catch (error) {
      console.error('[API Settings] Save error:', error);
      Alert.alert('❌ 错误', '保存失败: ' + String(error));
    } finally {
      setSaving(false);
    }
  };

  const handleShowDebug = async () => {
    const allSettings = await getAllSettings();
    const keys = Object.keys(allSettings);
    const info = keys.length > 0
      ? keys.map(k => `${k}: ${allSettings[k].substring(0, 20)}${allSettings[k].length > 20 ? '...' : ''}`).join('\n')
      : '(无设置数据)';
    Alert.alert('调试信息', `数据库中的设置:\n\n${info}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌤️ 天气信息</Text>
        <Text style={styles.description}>
          天气数据由 Open-Meteo 免费 API 提供，无需配置，自动根据 GPS 位置获取实时天气。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 智谱 AI API</Text>
        <Text style={styles.description}>
          用于 AI 鱼类识别（GLM-4V-Flash 免费模型）。
          {'\n'}免费注册：open.bigmodel.cn
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="输入智谱 AI API Key"
            value={zhipuKey}
            onChangeText={setZhipuKey}
            placeholderTextColor="#ccc"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showKey}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={handleToggleShow}>
            <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        {zhipuKey ? (
          <Text style={styles.keyPreview}>
            当前 Key: {showKey ? zhipuKey : `${zhipuKey.substring(0, 8)}...${zhipuKey.substring(zhipuKey.length - 4)}`}
          </Text>
        ) : null}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>📋 说明</Text>
        <Text style={styles.infoText}>
          • 天气数据：自动获取，无需配置{'\n'}
          • 智谱 AI：不配置则 AI 识别不可用{'\n'}
          • 所有 API Key 仅存储在本地设备{'\n'}
          • 配置后立即生效，无需重启
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? '保存中...' : '💾 保存配置'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.debugBtn} onPress={handleShowDebug}>
        <Text style={styles.debugBtnText}>🔍 查看调试信息</Text>
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
  keyPreview: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 8,
    fontFamily: 'monospace',
  },
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
    marginBottom: 8,
    backgroundColor: '#1a5276',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  debugBtn: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 12,
    alignItems: 'center',
  },
  debugBtnText: { color: '#95a5a6', fontSize: 14 },
});