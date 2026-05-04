import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { fishEncyclopedia, FishSpecies, searchFish } from '../../data/fish-encyclopedia';
import { useCatches } from '../../hooks/useCatches';

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'freshwater', label: '淡水鱼' },
  { key: 'saltwater', label: '海水鱼' },
  { key: '鲤科', label: '鲤科' },
  { key: '鲈科', label: '鲈科' },
];

export default function EncyclopediaScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { fishCounts, loadRecords } = useCatches();

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const getFilteredFish = (): FishSpecies[] => {
    let result = search ? searchFish(search) : fishEncyclopedia;

    if (selectedCategory === 'freshwater') {
      result = result.filter((f) => f.category === 'freshwater');
    } else if (selectedCategory === 'saltwater') {
      result = result.filter((f) => f.category === 'saltwater');
    } else if (selectedCategory !== 'all') {
      result = result.filter((f) => f.family.includes(selectedCategory));
    }

    return result;
  };

  const filteredFish = getFilteredFish();

  const getCaughtCount = (fishId: string): number => {
    return fishCounts[fishId] || 0;
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="搜索鱼种..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#999"
      />

      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryBtn, selectedCategory === cat.key && styles.categoryActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.countBar}>
        <Text style={styles.countText}>共 {fishEncyclopedia.length} 种鱼</Text>
        <Text style={styles.countText}>
          已钓获 {Object.keys(fishCounts).length} 种
        </Text>
      </View>

      <FlatList
        data={filteredFish}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const caught = getCaughtCount(item.id);
          return (
            <TouchableOpacity
              style={styles.fishCard}
              onPress={() => router.push(`/fish/${item.id}`)}
            >
              <View style={[styles.fishIcon, caught > 0 && styles.fishIconCaught]}>
                <Text style={styles.fishEmoji}>{caught > 0 ? '🐟' : '🐠'}</Text>
              </View>
              <View style={styles.fishInfo}>
                <Text style={styles.fishName}>{item.name}</Text>
                <Text style={styles.fishFamily}>
                  {item.family} · {item.category === 'freshwater' ? '淡水' : '海水'}
                </Text>
                <Text style={styles.fishTemp}>
                  适宜水温 {item.optimalTemp.min}-{item.optimalTemp.max}°C
                </Text>
              </View>
              <View style={[styles.caughtBadge, caught > 0 && styles.caughtBadgeActive]}>
                <Text style={[styles.caughtText, caught > 0 && styles.caughtTextActive]}>
                  {caught > 0 ? `钓获 ${caught}` : '未钓获'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>没有找到匹配的鱼种</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  searchInput: {
    margin: 16,
    marginBottom: 8,
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
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ecf0f1',
  },
  categoryActive: { backgroundColor: '#1a5276' },
  categoryText: { fontSize: 14, color: '#7f8c8d' },
  categoryTextActive: { color: '#fff' },
  countBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  countText: { fontSize: 13, color: '#95a5a6' },
  list: { padding: 16, paddingTop: 0 },
  fishCard: {
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
  fishIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eaf2f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishIconCaught: { backgroundColor: '#d5f5e3' },
  fishEmoji: { fontSize: 24 },
  fishInfo: { flex: 1, marginLeft: 12 },
  fishName: { fontSize: 17, fontWeight: '600', color: '#2c3e50' },
  fishFamily: { fontSize: 13, color: '#95a5a6', marginTop: 2 },
  fishTemp: { fontSize: 12, color: '#3498db', marginTop: 2 },
  caughtBadge: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caughtBadgeActive: { backgroundColor: '#d5f5e3' },
  caughtText: { fontSize: 13, color: '#95a5a6' },
  caughtTextActive: { color: '#27ae60' },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#95a5a6' },
});
