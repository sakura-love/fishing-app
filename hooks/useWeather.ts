import { useState, useEffect, useRef } from 'react';
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

  const lastLocation = useRef<{ lat: number; lon: number } | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // 如果有上次位置，先用缓存位置快速加载天气
      if (lastLocation.current) {
        console.log('[Weather] Using cached location');
        const data = await getWeather(lastLocation.current.lat, lastLocation.current.lon);
        setWeather(data);
        setLoading(false);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('需要定位权限才能获取天气信息');
        setLocationName('未知位置');
        const data = await getWeather(39.9, 116.4);
        setWeather(data);
        setLoading(false);
        return;
      }

      // 使用较短超时的快速定位
      const location = await Location.getLastKnownPositionAsync() 
        ?? await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
        });
      
      const { latitude, longitude } = location.coords;
      lastLocation.current = { lat: latitude, lon: longitude };

      // 获取地名
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          setLocationName(place.city || place.region || '未知位置');
        }
      } catch {
        setLocationName('未知位置');
      }

      const data = await getWeather(latitude, longitude);
      setWeather(data);
    } catch (err) {
      console.error('Weather error:', err);
      setError('获取天气信息失败');
      setLocationName('未知位置');
      const data = await getWeather(39.9, 116.4);
      setWeather(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return { weather, loading, error, locationName, refresh: fetchWeather };
}
