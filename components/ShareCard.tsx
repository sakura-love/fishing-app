import { View, Text, StyleSheet, Image } from 'react-native';
import { CatchRecord } from '../services/types';
import { getFishById } from '../data/fish-encyclopedia';

interface ShareCardProps {
  record: CatchRecord;
  stats?: {
    totalCatches: number;
    uniqueSpecies: number;
  };
}

export function ShareCard({ record, stats }: ShareCardProps) {
  const fish = getFishById(record.fishSpeciesId);
  const date = new Date(record.caughtAt);
  const dateStr = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.appName}>🎣 钓鱼人宝典</Text>
      </View>

      {record.photoUri && (
        <Image source={{ uri: record.photoUri }} style={styles.photo} resizeMode="cover" />
      )}

      <View style={styles.content}>
        {!record.photoUri && <Text style={styles.fishEmoji}>🐟</Text>}
        <Text style={styles.fishName}>{record.fishName}</Text>
        {fish && (
          <Text style={styles.scientificName}>{fish.scientificName}</Text>
        )}

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          {record.length && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{record.length}</Text>
              <Text style={styles.statLabel}>cm</Text>
            </View>
          )}
          {record.weight && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{record.weight}</Text>
              <Text style={styles.statLabel}>kg</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Text style={styles.statValue}>{dateStr}</Text>
            <Text style={styles.statLabel}>日期</Text>
          </View>
        </View>

        {record.location && (
          <Text style={styles.location}>📍 {record.location}</Text>
        )}
      </View>

      {stats && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            累计钓获 {stats.totalCatches} 条 · {stats.uniqueSpecies} 种
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    backgroundColor: '#1a5276',
    padding: 16,
    alignItems: 'center',
  },
  appName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 24, alignItems: 'center' },
  photo: {
    width: '100%',
    height: 200,
  },
  fishEmoji: { fontSize: 64 },
  fishName: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', marginTop: 12 },
  scientificName: { fontSize: 14, color: '#95a5a6', fontStyle: 'italic', marginTop: 4 },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#1a5276',
    borderRadius: 2,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1a5276' },
  statLabel: { fontSize: 13, color: '#95a5a6', marginTop: 2 },
  location: { fontSize: 14, color: '#555', marginTop: 16 },
  footer: {
    backgroundColor: '#f5f8fa',
    padding: 12,
    alignItems: 'center',
  },
  footerText: { fontSize: 13, color: '#95a5a6' },
});
