import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useCatches } from '../../hooks/useCatches';

export default function ProfileScreen() {
  const router = useRouter();
  const { stats, loadRecords } = useCatches();

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🎣</Text>
        </View>
        <Text style={styles.name}>钓鱼人</Text>
        <Text style={styles.title}>记录每一条大鱼</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalCatches}</Text>
          <Text style={styles.statLabel}>总钓获</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.uniqueSpecies}</Text>
          <Text style={styles.statLabel}>鱼种数</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.maxLength || '-'}</Text>
          <Text style={styles.statLabel}>最大鱼(cm)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>成就</Text>
        <View style={styles.achievements}>
          {stats.totalCatches === 0 ? (
            <View style={styles.achievementEmpty}>
              <Text style={styles.achievementText}>去钓你的第一条鱼吧！</Text>
            </View>
          ) : (
            <>
              {stats.totalCatches >= 1 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🎉</Text>
                  <Text style={styles.achievementName}>初出茅庐</Text>
                  <Text style={styles.achievementDesc}>钓获第一条鱼</Text>
                </View>
              )}
              {stats.totalCatches >= 10 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🎣</Text>
                  <Text style={styles.achievementName}>小有斩获</Text>
                  <Text style={styles.achievementDesc}>累计钓获 10 条</Text>
                </View>
              )}
              {stats.uniqueSpecies >= 5 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🐟</Text>
                  <Text style={styles.achievementName}>鱼种猎人</Text>
                  <Text style={styles.achievementDesc}>识别 5 种不同鱼</Text>
                </View>
              )}
              {stats.maxLength >= 50 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🏆</Text>
                  <Text style={styles.achievementName}>大物猎手</Text>
                  <Text style={styles.achievementDesc}>钓获 50cm+ 的鱼</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设置</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/api')}
        >
          <Text style={styles.menuText}>API 配置</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/units')}
        >
          <Text style={styles.menuText}>单位偏好</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/about')}
        >
          <Text style={styles.menuText}>关于</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  header: {
    backgroundColor: '#1a5276',
    padding: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 40 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  title: { fontSize: 14, color: '#aed6f1', marginTop: 4 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1a5276' },
  statLabel: { fontSize: 13, color: '#95a5a6', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 12 },
  achievements: { gap: 10 },
  achievementEmpty: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  achievementText: { fontSize: 15, color: '#95a5a6' },
  achievementBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIcon: { fontSize: 28, marginRight: 12 },
  achievementName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  achievementDesc: { fontSize: 13, color: '#95a5a6', marginLeft: 'auto' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: { fontSize: 16, color: '#2c3e50' },
  menuArrow: { fontSize: 20, color: '#bdc3c7' },
});
