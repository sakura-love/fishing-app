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

async function acquireLocation(): Promise<{ lat: number; lon: number }> {
  // 1. 检查定位服务是否开启
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('请开启设备定位服务（GPS）');
  }

  // 2. 请求权限
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('需要定位权限才能获取天气信息');
  }

  // 3. 优先用缓存的位置（快）
  const last = await Location.getLastKnownPositionAsync();
  if (last) {
    return { lat: last.coords.latitude, lon: last.coords.longitude };
  }

  // 4. 用 watchPositionAsync + GPS 获取位置
  //    enableHighAccuracy: true 强制用 GPS，避免 WiFi 定位卡住
  //    timeInterval: 5000 每 5 秒返回一次，不会无限等待
  return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
    let settled = false;
    let sub: Location.LocationSubscription | null = null;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        sub?.remove();
        reject(new Error('GPS 定位超时，请到室外或空旷处重试'));
      }
    }, 15000);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        enableHighAccuracy: true,
        timeInterval: 5000,
        distanceInterval: 100,
      },
      (pos) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          sub?.remove();
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        }
      },
    ).then((s) => {
      sub = s;
    }).catch((err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(err);
      }
    });
  });
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
        try {
          const r = await getWeather(lastCoords.current.lat, lastCoords.current.lon);
          setWeather(r.weather);
          setLocationName(r.city);
          setLoading(false);
        } catch (_) {
          // 缓存坐标天气获取失败，继续重新定位
        }
      }

      // 2. 获取最新位置
      const { lat, lon } = await acquireLocation();
      lastCoords.current = { lat, lon };

      const r = await getWeather(lat, lon);
      setWeather(r.weather);
      setLocationName(r.city);
    } catch (e: any) {
      const msg = e?.message || '获取天气信息失败';
      setError(msg);
      setLocationName('暂时无法获取位置');
    } finally {
      setLoading(false);
      fetching.current = false;
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { weather, loading, error, locationName, refresh: load };
}
