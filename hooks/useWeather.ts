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
  // 1. 请求权限（先请求权限，再检查服务状态）
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('需要定位权限才能获取天气信息');
  }

  // 2. 检查定位服务是否开启（权限通过后再检查）
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('请开启设备定位服务（GPS）');
  }

  // 3. 优先用缓存的位置（快）
  const last = await Location.getLastKnownPositionAsync();
  if (last) {
    return { lat: last.coords.latitude, lon: last.coords.longitude };
  }

  // 4. 分层定位策略：先用低精度（network），再用高精度（GPS）
  // 这样即使GPS还没锁定卫星，也能先获取一个大概位置
  return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
    let settled = false;
    let sub: Location.LocationSubscription | null = null;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        sub?.remove();
        reject(new Error('定位超时，请检查定位服务是否开启'));
      }
    }, 20000); // 增加超时时间到20秒

    // 先用低精度定位（network），速度更快
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    }).then((pos) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      }
    }).catch(() => {
      // 低精度失败，继续用高精度
    });

    // 同时启动高精度定位（GPS），获取更精确的位置
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000, // 每3秒更新一次
        distanceInterval: 50, // 移动50米才更新
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
  const locationServiceEnabled = useRef<boolean | null>(null);

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
      locationServiceEnabled.current = true;

      const r = await getWeather(lat, lon);
      setWeather(r.weather);
      setLocationName(r.city);
    } catch (e: any) {
      const msg = e?.message || '获取天气信息失败';
      setError(msg);
      setLocationName('暂时无法获取位置');
      
      // 如果是定位服务未开启，监听服务状态变化
      if (msg.includes('定位服务') || msg.includes('GPS')) {
        locationServiceEnabled.current = false;
        startLocationServiceListener();
      }
    } finally {
      setLoading(false);
      fetching.current = false;
    }
  }, []);

  // 监听定位服务状态变化
  const startLocationServiceListener = useCallback(() => {
    // 每2秒检查一次定位服务状态
    const interval = setInterval(async () => {
      try {
        const enabled = await Location.hasServicesEnabledAsync();
        if (enabled && locationServiceEnabled.current === false) {
          // 定位服务已开启，重新获取位置
          locationServiceEnabled.current = true;
          clearInterval(interval);
          load();
        }
      } catch (error) {
        // 忽略检查错误
      }
    }, 2000);

    // 30秒后停止监听
    setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return { weather, loading, error, locationName, refresh: load };
}
