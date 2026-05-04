import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { useCatches } from '../../hooks/useCatches';
import { WeatherCard } from '../../components/WeatherCard';
import { getFishForWaterTemp, fishEncyclopedia } from '../../data/fish-encyclopedia';

export default function HomeScreen() {
  const router = useRouter();
  const { weather, loading: weatherLoading, locationName, refresh } = useWeather();
  const { loadRecords } = useCatches();

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const todayWeather = weather[0];
  const recommendedFish = todayWeather
    ? getFishForWaterTemp(todayWeather.waterTemp).slice(0, 5)
    : fishEncyclopedia.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>🎣 钓鱼人宝典</Text>
        <Text style={styles.location}>📍 {locationName}</Text>
        <Text style={styles.subtitle}>今天适合钓鱼吗？</Text>
      </View>

      {/* 天气卡片 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近三日天气与水温</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.refreshBtn}>刷新</Text>
          </TouchableOpacity>
        </View>

        {weatherLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1a5276" />
            <Text style={styles.loadingText}>获取天气中...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherScroll}>
            {weather.map((day, index) => (
              <WeatherCard key={day.date} day={day} isToday={index === 0} />
            ))}
          </ScrollView>
        )}
      </View>

      {/* 推荐鱼种 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日推荐鱼种</Text>
        <Text style={styles.sectionSubtitle}>根据当前水温推荐</Text>
        <View style={styles.fishGrid}>
          {recommendedFish.map((fish) => (
            <TouchableOpacity
              key={fish.id}
              style={styles.fishChip}
              onPress={() => router.push(`/fish/${fish.id}`)}
            >
              <Text style={styles.fishChipName}>{fish.name}</Text>
              <Text style={styles.fishChipTemp}>
                {fish.optimalTemp.min}-{fish.optimalTemp.max}°C
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 快捷操作 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快捷操作</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/identify')}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionLabel}>AI 识别</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/catch/new')}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionLabel}>记录钓获</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(tabs)/encyclopedia')}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionLabel}>鱼图鉴</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  header: {
    backgroundColor: '#1a5276',
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  location: { fontSize: 14, color: '#aed6f1', marginTop: 4 },
  subtitle: { fontSize: 16, color: '#aed6f1', marginTop: 4 },
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50' },
  sectionSubtitle: { fontSize: 13, color: '#95a5a6', marginTop: 2 },
  refreshBtn: { fontSize: 14, color: '#1a5276' },
  weatherScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  loadingBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
  },
  loadingText: { fontSize: 14, color: '#95a5a6', marginTop: 12 },
  adviceSection: { paddingHorizontal: 16 },
  adviceCard: {
    backgroundColor: '#eaf2f8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1a5276',
  },
  adviceTitle: { fontSize: 16, fontWeight: '600', color: '#1a5276' },
  adviceText: { fontSize: 14, color: '#2c3e50', marginTop: 8, lineHeight: 22 },
  adviceTempRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d4e6f1',
  },
  adviceTempLabel: { fontSize: 13, color: '#5d6d7e' },
  adviceTempValue: { fontSize: 18, fontWeight: 'bold', color: '#1a5276' },
  fishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  fishChip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fishChipName: { fontSize: 15, fontWeight: '600', color: '#2c3e50' },
  fishChipTemp: { fontSize: 12, color: '#3498db', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: { fontSize: 32 },
  actionLabel: { fontSize: 14, color: '#2c3e50', marginTop: 8 },
});
