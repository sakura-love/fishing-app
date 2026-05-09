import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCustomFish } from '../../hooks/useCustomFish';
import { FishSpecies } from '../../data/fish-encyclopedia';

export default function AddFishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; photoUri?: string; description?: string }>();
  const { addCustomFish } = useCustomFish();
  
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState<'freshwater' | 'saltwater'>('freshwater');
  const [family, setFamily] = useState('');
  const [description, setDescription] = useState('');
  const [avgSizeMin, setAvgSizeMin] = useState('');
  const [avgSizeMax, setAvgSizeMax] = useState('');
  const [optimalTempMin, setOptimalTempMin] = useState('15');
  const [optimalTempMax, setOptimalTempMax] = useState('25');
  const [tips, setTips] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (params.name) setName(params.name);
    if (params.photoUri) setPhotoUri(params.photoUri);
    if (params.description) setDescription(params.description);
  }, [params.name, params.photoUri, params.description]);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能选择照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入鱼种名称');
      return;
    }

    const id = `custom-${Date.now()}`;
    const newFish: FishSpecies & { photoUri?: string } = {
      id,
      name: name.trim(),
      scientificName: scientificName.trim(),
      category,
      family: family.trim(),
      description: description.trim(),
      avgSize: {
        min: parseFloat(avgSizeMin) || 0,
        max: parseFloat(avgSizeMax) || 0,
      },
      optimalTemp: {
        min: parseFloat(optimalTempMin) || 15,
        max: parseFloat(optimalTempMax) || 25,
      },
      tips: tips.trim(),
      photoUri: photoUri || undefined,
    };

    try {
      await addCustomFish(newFish);
      Alert.alert('成功', '新鱼种已添加到图鉴', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.photoSection}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>添加鱼的照片</Text>
          </View>
        )}
        <View style={styles.photoButtons}>
          <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
            <Text style={styles.photoBtnText}>📷 拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
            <Text style={styles.photoBtnText}>🖼️ 相册</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>鱼种名称 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例如：金鱼"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>学名</Text>
          <TextInput
            style={styles.input}
            value={scientificName}
            onChangeText={setScientificName}
            placeholder="例如：Carassius auratus"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>类别</Text>
          <View style={styles.categoryButtons}>
            <TouchableOpacity
              style={[styles.categoryBtn, category === 'freshwater' && styles.categoryActive]}
              onPress={() => setCategory('freshwater')}
            >
              <Text style={[styles.categoryBtnText, category === 'freshwater' && styles.categoryBtnTextActive]}>
                淡水鱼
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryBtn, category === 'saltwater' && styles.categoryActive]}
              onPress={() => setCategory('saltwater')}
            >
              <Text style={[styles.categoryBtnText, category === 'saltwater' && styles.categoryBtnTextActive]}>
                海水鱼
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>科属</Text>
          <TextInput
            style={styles.input}
            value={family}
            onChangeText={setFamily}
            placeholder="例如：鲤科"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>描述</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="描述鱼的特征..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>平均体长 (cm)</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={avgSizeMin}
                onChangeText={setAvgSizeMin}
                placeholder="最小"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <Text style={styles.rangeSep}>-</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={avgSizeMax}
                onChangeText={setAvgSizeMax}
                placeholder="最大"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>适宜水温 (°C)</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={optimalTempMin}
                onChangeText={setOptimalTempMin}
                placeholder="最低"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <Text style={styles.rangeSep}>-</Text>
              <TextInput
                style={[styles.input, styles.rangeInput]}
                value={optimalTempMax}
                onChangeText={setOptimalTempMax}
                placeholder="最高"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>钓鱼技巧</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={tips}
            onChangeText={setTips}
            placeholder="分享钓鱼心得..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>保存到图鉴</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  photoSection: {
    padding: 16,
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    backgroundColor: '#1a5276',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  photoBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInput: {
    flex: 1,
  },
  rangeSep: {
    fontSize: 18,
    color: '#95a5a6',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBtn: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  categoryActive: {
    backgroundColor: '#1a5276',
  },
  categoryBtnText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  categoryBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
