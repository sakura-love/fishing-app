import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { WeatherDay } from '../services/types';
import { getWeather } from '../services/weather';

interface UseWeatherResult {
  weather: WeatherDay[];
  loading: boolean;
  error: string | null;
  locationName: string;
  refresh: () => Promise<void>;
}

export function useWeather(): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('定位中...');
  const lastCoords = useRef<{ lat: number; lon: number } | null>(null);
  const fetching = useRef(false);

  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    setLoading(true);
    setError(null);

    try {
      // 1. 有缓存坐标就先用它快速出数据
      if (lastCoords.current) {
        const r = await getWeather(lastCoords.current.lat, lastCoords.current.lon);
        setWeather(r.weather);
        if (r.city !== '未知位置') setLocationName(r.city);
        setLoading(false);
      }

      // 2. 获取最新 GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('需要定位权限才能获取天气信息');
        setLocationName('未知位置');
        const r = await getWeather(39.9, 116.4);
        setWeather(r.weather);
        return;
      }

      const pos = await Location.getLastKnownPositionAsync()
        ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lon } = pos.coords;
      lastCoords.current = { lat, lon };

      const r = await getWeather(lat, lon);
      setWeather(r.weather);
      setLocationName(r.city);
    } catch (e) {
      setError('获取天气信息失败');
      setLocationName('未知位置');
      const r = await getWeather(39.9, 116.4);
      setWeather(r.weather);
    } finally {
      setLoading(false);
      fetching.current = false;
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { weather, loading, error, locationName, refresh: load };
}
