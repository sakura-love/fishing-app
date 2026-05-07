import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useCatches } from '../../hooks/useCatches';
import { useUnits } from '../../hooks/useUnits';
import { getFishImageSource } from '../../data/fish-images';


export default function RecordsScreen() {
  const router = useRouter();
  const { records, loading, loadRecords } = useCatches();
  const { formatLength, formatWeight } = useUnits();

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <View style={styles.container}>
      {records.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎣</Text>
          <Text style={styles.emptyTitle}>还没有钓获记录</Text>
          <Text style={styles.emptySubtitle}>去钓鱼吧！记录你的每一条大鱼</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/catch/new')}
          >
            <Text style={styles.addBtnText}>记录第一条鱼</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recordCard}
              onPress={() => router.push(`/catch/${item.id}`)}
            >
              <View style={styles.recordPreview}>
                <Image source={getFishImageSource(item.fishSpeciesId)} style={styles.recordImage} resizeMode="contain" />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordName}>{item.fishName}</Text>
                <Text style={styles.recordDate}>{formatDate(item.caughtAt)}</Text>
                {item.location && (
                  <Text style={styles.recordLocation}>📍 {item.location}</Text>
                )}
              </View>
              <View style={styles.recordStats}>
                {item.length && (
                  <Text style={styles.recordSize}>{formatLength(item.length)}</Text>
                )}
                {item.weight && (
                  <Text style={styles.recordWeight}>{formatWeight(item.weight)}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/catch/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#2c3e50', marginTop: 16 },
  emptySubtitle: { fontSize: 15, color: '#95a5a6', marginTop: 8 },
  addBtn: {
    marginTop: 24,
    backgroundColor: '#1a5276',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  list: { padding: 16 },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordPreview: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recordImage: { width: 56, height: 56, borderRadius: 12 },
  recordInfo: { flex: 1, marginLeft: 12 },
  recordName: { fontSize: 17, fontWeight: '600', color: '#2c3e50' },
  recordDate: { fontSize: 13, color: '#95a5a6', marginTop: 2 },
  recordLocation: { fontSize: 12, color: '#3498db', marginTop: 2 },
  recordStats: { alignItems: 'flex-end' },
  recordSize: { fontSize: 16, fontWeight: '600', color: '#1a5276' },
  recordWeight: { fontSize: 14, color: '#95a5a6', marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a5276',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', marginTop: -2 },
});
