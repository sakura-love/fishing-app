import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFishById } from '../../data/fish-encyclopedia';
import { useCatches } from '../../hooks/useCatches';
import { useUnits } from '../../hooks/useUnits';
import { getFishImageSource } from '../../data/fish-images';

const CATEGORY_LABELS: Record<string, string> = {
  freshwater: '淡水鱼',
  saltwater: '海水鱼',
};

export default function FishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fishCounts } = useCatches();

  const { lengthUnit, tempUnit } = useUnits();
  const fish = getFishById(id || '');

  if (!fish) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>未找到该鱼种</Text>
      </View>
    );
  }

  const caughtCount = fishCounts[fish.id] || 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={getFishImageSource(fish.id)} style={styles.fishImage} resizeMode="cover" />
        <Text style={styles.fishName}>{fish.name}</Text>
        <Text style={styles.scientificName}>{fish.scientificName}</Text>
        {caughtCount > 0 && (
          <View style={styles.caughtBadge}>
            <Text style={styles.caughtBadgeText}>已钓获 {caughtCount} 条</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>分类</Text>
          <Text style={styles.infoValue}>
            {CATEGORY_LABELS[fish.category]} · {fish.family}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>常见体型</Text>
          <Text style={styles.infoValue}>{fish.avgSize.min}-{fish.avgSize.max} {lengthUnit}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>适宜水温</Text>
          <Text style={styles.infoValue}>{fish.optimalTemp.min}-{fish.optimalTemp.max} {tempUnit}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>简介</Text>
        <Text style={styles.description}>{fish.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>钓法建议</Text>
        <Text style={styles.description}>{fish.tips}</Text>
      </View>

      <TouchableOpacity
        style={styles.recordBtn}
        onPress={() => router.push({ pathname: '/catch/new', params: { fishId: fish.id, fishName: fish.name } })}
      >
        <Text style={styles.recordBtnText}>记录钓获</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  header: {
    backgroundColor: '#1a5276',
    padding: 32,
    alignItems: 'center',
  },
  fishImage: { width: 96, height: 96, borderRadius: 16 },
  fishName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  scientificName: { fontSize: 14, color: '#aed6f1', fontStyle: 'italic', marginTop: 4 },
  caughtBadge: {
    marginTop: 12,
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  caughtBadgeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 15, color: '#95a5a6' },
  infoValue: { fontSize: 15, color: '#2c3e50', fontWeight: '500' },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  description: { fontSize: 15, color: '#555', lineHeight: 24 },
  recordBtn: {
    margin: 16,
    backgroundColor: '#1a5276',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  recordBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  errorText: { fontSize: 16, color: '#95a5a6', textAlign: 'center', marginTop: 48 },
});
