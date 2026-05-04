import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { fishEncyclopedia, FishSpecies, getFishById } from '../../data/fish-encyclopedia';
import { useCatches } from '../../hooks/useCatches';

export default function NewCatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fishId?: string; fishName?: string }>();
  const { addRecord } = useCatches();
  const [selectedFish, setSelectedFish] = useState<FishSpecies | null>(null);

  useEffect(() => {
    if (params.fishId) {
      const fish = getFishById(params.fishId);
      if (fish) setSelectedFish(fish);
    }
  }, [params.fishId]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showFishPicker, setShowFishPicker] = useState(false);
  const [fishSearch, setFishSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredFish = fishSearch
    ? fishEncyclopedia.filter(
        (f) => f.name.includes(fishSearch) || f.family.includes(fishSearch)
      )
    : fishEncyclopedia;

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
    if (!selectedFish) {
      Alert.alert('提示', '请选择鱼种');
      return;
    }
    setSaving(true);
    try {
      await addRecord({
        id: Date.now().toString(),
        fishSpeciesId: selectedFish.id,
        fishName: selectedFish.name,
        photoUri: photoUri || undefined,
        length: length ? parseFloat(length) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        location: location || undefined,
        caughtAt: new Date().toISOString(),
        notes: notes || undefined,
        identifiedBy: 'manual',
      });
      Alert.alert('成功', '钓获记录已保存！', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>鱼种 *</Text>
        <TouchableOpacity
          style={styles.fishSelector}
          onPress={() => setShowFishPicker(true)}
        >
          <Text style={selectedFish ? styles.fishSelected : styles.fishPlaceholder}>
            {selectedFish ? `${selectedFish.name} (${selectedFish.family})` : '点击选择鱼种'}
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.aiBtn}
          onPress={() => router.push('/identify')}
        >
          <Text style={styles.aiBtnText}>📷 AI 识别鱼种</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>拍照</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
            <Text style={styles.photoIcon}>🖼️</Text>
            <Text style={styles.photoText}>相册</Text>
          </TouchableOpacity>
        </View>
        {photoUri && (
          <View style={styles.photoPreview}>
            <Text style={styles.photoPreviewText}>已选择照片</Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>长度 (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={length}
            onChangeText={setLength}
            keyboardType="numeric"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>重量 (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholderTextColor="#ccc"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>钓点</Text>
        <TextInput
          style={styles.input}
          placeholder="输入钓点名称"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#ccc"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>备注</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="记录更多细节..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholderTextColor="#ccc"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? '保存中...' : '保存记录'}</Text>
      </TouchableOpacity>

      {/* Fish Picker Modal */}
      <Modal visible={showFishPicker} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>选择鱼种</Text>
            <TouchableOpacity onPress={() => setShowFishPicker(false)}>
              <Text style={styles.modalClose}>关闭</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalSearch}
            placeholder="搜索鱼种..."
            value={fishSearch}
            onChangeText={setFishSearch}
            placeholderTextColor="#999"
          />
          <FlatList
            data={filteredFish}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.fishOption}
                onPress={() => {
                  setSelectedFish(item);
                  setShowFishPicker(false);
                  setFishSearch('');
                }}
              >
                <Text style={styles.fishOptionName}>{item.name}</Text>
                <Text style={styles.fishOptionFamily}>
                  {item.family} · {item.category === 'freshwater' ? '淡水' : '海水'}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  section: { padding: 16, paddingBottom: 0 },
  label: { fontSize: 15, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  fishSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fishSelected: { fontSize: 16, color: '#2c3e50' },
  fishPlaceholder: { fontSize: 16, color: '#bdc3c7' },
  arrow: { fontSize: 20, color: '#bdc3c7' },
  aiBtn: {
    marginTop: 8,
    backgroundColor: '#eaf2f8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  aiBtnText: { fontSize: 15, color: '#1a5276', fontWeight: '500' },
  photoRow: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoIcon: { fontSize: 32 },
  photoText: { fontSize: 14, color: '#95a5a6', marginTop: 8 },
  photoPreview: {
    marginTop: 8,
    backgroundColor: '#d5f5e3',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  photoPreviewText: { fontSize: 14, color: '#27ae60' },
  row: { flexDirection: 'row', gap: 8 },
  input: {
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
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: {
    margin: 16,
    backgroundColor: '#1a5276',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#f5f8fa' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a5276',
    paddingTop: 48,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalClose: { fontSize: 16, color: '#aed6f1' },
  modalSearch: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  fishOption: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
  },
  fishOptionName: { fontSize: 17, fontWeight: '600', color: '#2c3e50' },
  fishOptionFamily: { fontSize: 13, color: '#95a5a6', marginTop: 2 },
});
