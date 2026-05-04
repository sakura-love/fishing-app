import { View, Text, StyleSheet } from 'react-native';
import { WeatherDay } from '../services/types';
import { formatDate } from '../services/weather';
import { getWaterTempRating } from '../utils/water-temp';

interface WeatherCardProps {
  day: WeatherDay;
  isToday?: boolean;
}

const RATING_COLORS = {
  excellent: '#27ae60',
  good: '#2980b9',
  fair: '#f39c12',
  poor: '#e74c3c',
};

const RATING_LABELS = {
  excellent: '极佳',
  good: '良好',
  fair: '一般',
  poor: '较差',
};

export function WeatherCard({ day, isToday }: WeatherCardProps) {
  const rating = getWaterTempRating(day.waterTemp);

  return (
    <View style={[styles.card, isToday && styles.todayCard]}>
      <View style={styles.topRow}>
        <Text style={[styles.date, isToday && styles.todayText]}>
          {formatDate(day.date)}
        </Text>
        <Text style={styles.weatherIcon}>{day.iconDay}</Text>
      </View>

      <Text style={styles.weatherText}>{day.textDay}</Text>

      <View style={styles.tempRow}>
        <Text style={styles.tempHigh}>{day.tempMax}°</Text>
        <Text style={styles.tempLow}>{day.tempMin}°</Text>
      </View>

      {isToday && day.currentTemp !== undefined ? (
        <View style={styles.currentRow}>
          <View style={styles.currentItem}>
            <Text style={styles.currentLabel}>当前温度</Text>
            <Text style={styles.currentValue}>{day.currentTemp}°C</Text>
          </View>
          <View style={styles.currentItem}>
            <Text style={styles.currentLabel}>当前水温</Text>
            <Text style={styles.currentValue}>{day.currentWaterTemp}°C</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.waterTempRow}>
        <Text style={styles.waterTempLabel}>{isToday ? '日均水温' : '预估水温'}</Text>
        <Text style={styles.waterTempValue}>{day.waterTemp}°C</Text>
      </View>

      <View style={[styles.ratingBadge, { backgroundColor: RATING_COLORS[rating] }]}>
        <Text style={styles.ratingText}>{RATING_LABELS[rating]}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailText}>💨 {day.windSpeed}km/h</Text>
        <Text style={styles.detailText}>💧 {day.humidity}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    width: 160,
    marginRight: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#1a5276',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: { fontSize: 14, color: '#95a5a6', fontWeight: '500' },
  todayText: { color: '#1a5276', fontWeight: '700' },
  weatherIcon: { fontSize: 28 },
  weatherText: { fontSize: 14, color: '#555', marginTop: 4 },
  tempRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  tempHigh: { fontSize: 20, fontWeight: 'bold', color: '#e74c3c' },
  tempLow: { fontSize: 20, fontWeight: 'bold', color: '#3498db' },
  waterTempRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  waterTempLabel: { fontSize: 13, color: '#95a5a6' },
  waterTempValue: { fontSize: 16, fontWeight: '600', color: '#1a5276' },
  ratingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  ratingText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  currentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  currentItem: { alignItems: 'center' },
  currentLabel: { fontSize: 11, color: '#95a5a6' },
  currentValue: { fontSize: 15, fontWeight: '700', color: '#27ae60', marginTop: 2 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailText: { fontSize: 12, color: '#95a5a6' },
});
