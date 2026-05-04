import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../../services/storage';

export default function UnitsScreen() {
  const [useMetric, setUseMetric] = useState(true);
  const [useKg, setUseKg] = useState(true);
  const [useCelsius, setUseCelsius] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const metric = await getSetting('use_metric');
    const kg = await getSetting('use_kg');
    const celsius = await getSetting('use_celsius');
    
    setUseMetric(metric !== 'false');
    setUseKg(kg !== 'false');
    setUseCelsius(celsius !== 'false');
    setLoaded(true);
  }

  async function toggleMetric(value: boolean) {
    setUseMetric(value);
    await setSetting('use_metric', String(value));
  }

  async function toggleKg(value: boolean) {
    setUseKg(value);
    await setSetting('use_kg', String(value));
  }

  async function toggleCelsius(value: boolean) {
    setUseCelsius(value);
    await setSetting('use_celsius', String(value));
  }

  if (!loaded) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>长度单位</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.label}>使用厘米 (cm)</Text>
            <Text style={styles.hint}>关闭后使用英寸 (inch)</Text>
          </View>
          <Switch
            value={useMetric}
            onValueChange={toggleMetric}
            trackColor={{ false: '#bdc3c7', true: '#85c1e9' }}
            thumbColor={useMetric ? '#1a5276' : '#ecf0f1'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>重量单位</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.label}>使用千克 (kg)</Text>
            <Text style={styles.hint}>关闭后使用磅 (lb)</Text>
          </View>
          <Switch
            value={useKg}
            onValueChange={toggleKg}
            trackColor={{ false: '#bdc3c7', true: '#85c1e9' }}
            thumbColor={useKg ? '#1a5276' : '#ecf0f1'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>温度单位</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.label}>使用摄氏度 (°C)</Text>
            <Text style={styles.hint}>关闭后使用华氏度 (°F)</Text>
          </View>
          <Switch
            value={useCelsius}
            onValueChange={toggleCelsius}
            trackColor={{ false: '#bdc3c7', true: '#85c1e9' }}
            thumbColor={useCelsius ? '#1a5276' : '#ecf0f1'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8fa' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowLeft: { flex: 1 },
  label: { fontSize: 16, color: '#2c3e50' },
  hint: { fontSize: 13, color: '#95a5a6', marginTop: 4 },
});