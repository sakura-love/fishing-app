import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { identifyFish } from '../services/fish-recognition';
import { IdentifyResult } from '../services/types';

type IdentifyState = 'idle' | 'loading' | 'result';

export default function IdentifyScreen() {
  const router = useRouter();
  const [state, setState] = useState<IdentifyState>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相机权限才能拍照识别');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      processImage(pickerResult.assets[0].uri);
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能选择照片');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      processImage(pickerResult.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setPhotoUri(uri);
    setState('loading');

    try {
      const identifyResult = await identifyFish(uri);
      setResult(identifyResult);
      setState('result');
    } catch (error) {
      console.error('Identify error:', error);
      Alert.alert('识别失败', '无法识别该图片，请重试');
      setState('idle');
    }
  };

  const handleConfirm = () => {
    if (result) {
      router.push({
        pathname: '/catch/new',
        params: { fishId: result.speciesId, fishName: result.name },
      });
    }
  };

  const handleRetry = () => {
    setState('idle');
    setResult(null);
    setPhotoUri(null);
  };

  return (
    <View style={styles.container}>
      {state === 'idle' && (
        <View style={styles.center}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.title}>AI 鱼类识别</Text>
          <Text style={styles.subtitle}>拍摄鱼的照片，自动识别鱼种</Text>
          <TouchableOpacity style={styles.btn} onPress={handleTakePhoto}>
            <Text style={styles.btnText}>拍照识别</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handlePickPhoto}>
            <Text style={styles.secondaryBtnText}>从相册选择</Text>
          </TouchableOpacity>
        </View>
      )}

      {state === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a5276" />
          <Text style={styles.loadingText}>AI 识别中...</Text>
          <Text style={styles.loadingSubtext}>正在分析鱼的特征</Text>
        </View>
      )}

      {state === 'result' && result && (
        <View style={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultIcon}>🐟</Text>
            <Text style={styles.resultName}>{result.name}</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${result.confidence}%`,
                    backgroundColor:
                      result.confidence >= 80
                        ? '#27ae60'
                        : result.confidence >= 60
                        ? '#f39c12'
                        : '#e74c3c',
                  },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>置信度 {result.confidence}%</Text>
            <Text style={styles.resultDesc}>{result.description}</Text>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>确认并记录钓获</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>重新拍照</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#95a5a6', marginTop: 8, textAlign: 'center' },
  btn: {
    marginTop: 32,
    backgroundColor: '#1a5276',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 24,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  secondaryBtn: { marginTop: 16, padding: 12 },
  secondaryBtnText: { color: '#1a5276', fontSize: 16 },
  loadingText: { fontSize: 18, color: '#2c3e50', marginTop: 20 },
  loadingSubtext: { fontSize: 14, color: '#95a5a6', marginTop: 8 },
  resultContainer: { flex: 1, padding: 16 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultIcon: { fontSize: 64 },
  resultName: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginTop: 12 },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: { fontSize: 14, color: '#95a5a6', marginTop: 8 },
  resultDesc: {
    fontSize: 15,
    color: '#555',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultActions: { marginTop: 24 },
  confirmBtn: {
    backgroundColor: '#1a5276',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  retryBtn: { marginTop: 12, padding: 12, alignItems: 'center' },
  retryBtnText: { color: '#1a5276', fontSize: 16 },
});
