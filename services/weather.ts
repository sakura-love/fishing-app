import { WeatherDay } from './types';
import { estimateWaterTemp } from '../utils/water-temp';
import { getSetting, setSetting } from './storage';

// Open-Meteo 免费天气 API（无需 API Key）
const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

// 缓存有效期（毫秒）
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟

// WMO 天气代码映射为中文描述
const WMO_WEATHER_CODES: Record<number, string> = {
  0: '晴',
  1: '大部晴朗',
  2: '局部多云',
  3: '阴天',
  45: '雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '中毛毛雨',
  55: '大毛毛雨',
  56: '冻毛毛雨',
  57: '重度冻毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '冻小雨',
  67: '冻大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '冰粒',
  80: '小阵雨',
  81: '中阵雨',
  82: '大阵雨',
  85: '小阵雪',
  86: '大阵雪',
  95: '雷暴',
  96: '雷暴伴小冰雹',
  99: '雷暴伴大冰雹',
};

interface WeatherCache {
  timestamp: number;
  lat: number;
  lon: number;
  data: WeatherDay[];
}

let memoryCache: WeatherCache | null = null;

export async function getWeather(lat: number, lon: number): Promise<WeatherDay[]> {
  // 检查内存缓存（相同坐标，30分钟内有效）
  if (memoryCache && 
      Math.abs(memoryCache.lat - lat) < 0.01 && 
      Math.abs(memoryCache.lon - lon) < 0.01 &&
      Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    console.log('[Weather] Using memory cache');
    return memoryCache.data;
  }

  // 检查数据库缓存
  try {
    const cachedJson = await getSetting('weather_cache');
    if (cachedJson) {
      const cached: WeatherCache = JSON.parse(cachedJson);
      if (Math.abs(cached.lat - lat) < 0.01 && 
          Math.abs(cached.lon - lon) < 0.01 &&
          Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[Weather] Using DB cache');
        memoryCache = cached;
        return cached.data;
      }
    }
  } catch (e) {
    console.warn('[Weather] Cache read error:', e);
  }

  // 请求新数据
  try {
    const url = `${OPEN_METEO_API}?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,precipitation_sum` +
      `&hourly=temperature_2m,relative_humidity_2m` +
      `&current=temperature_2m,relative_humidity_2m,weathercode,wind_speed_10m` +
      `&timezone=auto&forecast_days=3`;

    console.log('[Weather] Fetching from Open-Meteo...');
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[Weather] API error:', response.status);
      return getMockWeather();
    }

    const data = await response.json();

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.error('[Weather] Empty response');
      return getMockWeather();
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const currentHour = now.getHours();

    // 获取当前温度和当前小时的湿度
    const currentTemp = data.current?.temperature_2m ?? null;
    const currentHumidity = data.current?.relative_humidity_2m ?? null;
    const currentWindSpeed = data.current?.wind_speed_10m ?? null;

    // 获取每日平均湿度（从小时数据中提取）
    const dailyHumidity = calculateDailyHumidity(data);

    const weatherDays = data.daily.time.map((date: string, index: number) => {
      const tempMax = Math.round(data.daily.temperature_2m_max[index]);
      const tempMin = Math.round(data.daily.temperature_2m_min[index]);
      const avgTemp = (tempMax + tempMin) / 2;
      const windSpeed = Math.round(data.daily.windspeed_10m_max[index]);
      const weatherCode = data.daily.weathercode[index];
      const precip = data.daily.precipitation_sum[index] || 0;
      const humidity = dailyHumidity[index] || 60;

      const day: WeatherDay = {
        date,
        tempMax,
        tempMin,
        textDay: WMO_WEATHER_CODES[weatherCode] || '未知',
        iconDay: getWeatherIconFromCode(weatherCode, precip),
        windSpeed,
        humidity,
        precip,
        waterTemp: estimateWaterTemp(avgTemp, windSpeed, month),
      };

      // 只在第一天（今天）添加当前温度和当前水温
      if (index === 0) {
        if (currentTemp !== null) {
          day.currentTemp = Math.round(currentTemp);
          day.currentWaterTemp = estimateWaterTemp(
            currentTemp,
            currentWindSpeed ?? windSpeed,
            month
          );
        }
      }

      return day;
    });

    // 缓存结果
    const cacheObj: WeatherCache = {
      timestamp: Date.now(),
      lat,
      lon,
      data: weatherDays,
    };
    memoryCache = cacheObj;
    try {
      await setSetting('weather_cache', JSON.stringify(cacheObj));
    } catch (e) {
      console.warn('[Weather] Cache save error:', e);
    }

    console.log('[Weather] Data fetched successfully');
    return weatherDays;
  } catch (error) {
    console.error('[Weather] Fetch error:', error);
    return getMockWeather();
  }
}

function calculateDailyHumidity(data: any): number[] {
  if (data.hourly?.relative_humidity_2m) {
    const hourly = data.hourly.relative_humidity_2m as number[];
    const dailyAvg: number[] = [];
    for (let i = 0; i < 3 && i * 24 < hourly.length; i++) {
      const dayHours = hourly.slice(i * 24, (i + 1) * 24);
      const avg = Math.round(dayHours.reduce((a, b) => a + b, 0) / dayHours.length);
      dailyAvg.push(avg);
    }
    return dailyAvg;
  }
  return [60, 55, 65];
}

function getWeatherIconFromCode(code: number, precip: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '❄️';
  if (code >= 95) return '⛈️';
  if (precip > 0) return '🌧️';
  return '🌤️';
}

function getMockWeather(): WeatherDay[] {
  const today = new Date();
  const month = today.getMonth() + 1;

  const mockDays = [
    { tempMax: 25, tempMin: 18, textDay: '多云', windSpeed: 10, humidity: 65, precip: 0, currentTemp: 22 },
    { tempMax: 27, tempMin: 19, textDay: '晴', windSpeed: 8, humidity: 55, precip: 0 },
    { tempMax: 23, tempMin: 17, textDay: '小雨', windSpeed: 15, humidity: 80, precip: 5 },
  ];

  return mockDays.map((mock, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    const avgTemp = (mock.tempMax + mock.tempMin) / 2;

    const day: WeatherDay = {
      date: date.toISOString().split('T')[0],
      tempMax: mock.tempMax,
      tempMin: mock.tempMin,
      textDay: mock.textDay,
      iconDay: getWeatherIcon(mock.textDay),
      windSpeed: mock.windSpeed,
      humidity: mock.humidity,
      precip: mock.precip,
      waterTemp: estimateWaterTemp(avgTemp, mock.windSpeed, month),
    };

    if (index === 0 && mock.currentTemp) {
      day.currentTemp = mock.currentTemp;
      day.currentWaterTemp = estimateWaterTemp(mock.currentTemp, mock.windSpeed, month);
    }

    return day;
  });
}

function getWeatherIcon(text: string): string {
  if (text.includes('晴')) return '☀️';
  if (text.includes('多云')) return '⛅';
  if (text.includes('阴')) return '☁️';
  if (text.includes('雨')) return '🌧️';
  if (text.includes('雪')) return '❄️';
  if (text.includes('雾')) return '🌫️';
  return '🌤️';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateStr === today.toISOString().split('T')[0]) return '今天';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return '明天';

  return `${date.getMonth() + 1}月${date.getDate()}日`;
}