import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useCatches } from '../../hooks/useCatches';
import { CatchRecord } from '../../services/types';
import { ShareCard } from '../../components/ShareCard';

export default function CatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { records, deleteRecord, stats } = useCatches();
  const [record, setRecord] = useState<CatchRecord | null>(null);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    const found = records.find((r) => r.id === id);
    if (found) setRecord(found);
  }, [id, records]);

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这条钓获记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          if (id) {
            await deleteRecord(id);
            router.back();
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      if (!shareCardRef.current) return;

      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('提示', '当前设备不支持分享');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: '分享钓获记录',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('分享失败', '请重试');
    }
  };

  if (!record) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imagePlaceholder}>
        {record.photoUri ? (
          <Image source={{ uri: record.photoUri }} style={styles.fishPhoto} resizeMode="cover" />
        ) : (
          <>
            <Text style={styles.fishEmoji}>🐟</Text>
            <Text style={styles.fishName}>{record.fishName}</Text>
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.date}>{formatDate(record.caughtAt)}</Text>

        <View style={styles.statsRow}>
          {record.length && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{record.length}</Text>
              <Text style={styles.statLabel}>长度(cm)</Text>
            </View>
          )}
          {record.weight && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{record.weight}</Text>
              <Text style={styles.statLabel}>重量(kg)</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Text style={styles.statValue}>{record.identifiedBy === 'ai' ? 'AI' : '手动'}</Text>
            <Text style={styles.statLabel}>识别方式</Text>
          </View>
        </View>
      </View>

      {record.location && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>钓点</Text>
          <Text style={styles.text}>📍 {record.location}</Text>
        </View>
      )}

      {record.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注</Text>
          <Text style={styles.text}>{record.notes}</Text>
        </View>
      )}

      {/* 隐藏的分享卡片 */}
      <View style={styles.shareCardContainer} ref={shareCardRef} collapsable={false}>
        <ShareCard record={record} stats={stats} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>分享到社交媒体</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>删除记录</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  imagePlaceholder: {
    backgroundColor: '#1a5276',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishPhoto: {
    width: '100%',
    height: 250,
  },
  fishEmoji: { fontSize: 64 },
  fishName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  date: { fontSize: 14, color: '#95a5a6' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1a5276' },
  statLabel: { fontSize: 13, color: '#95a5a6', marginTop: 4 },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
  text: { fontSize: 15, color: '#555', lineHeight: 22 },
  shareCardContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  actions: { padding: 16 },
  shareBtn: {
    backgroundColor: '#1a5276',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  deleteBtnText: { color: '#e74c3c', fontSize: 16 },
  loadingText: { fontSize: 16, color: '#95a5a6', textAlign: 'center', marginTop: 48 },
});
