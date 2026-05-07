import { WeatherDay } from './types';
import { estimateWaterTemp } from '../utils/water-temp';
import { getSetting, setSetting } from './storage';
import { getWeatherApiKey } from '../utils/crypto';

// ==================== 配置 ====================
const API_HOST = 'https://p24up5fjtr.re.qweatherapi.com';
const API_KEY = getWeatherApiKey();
const CACHE_TTL = 30 * 60 * 1000;
const CACHE_KEY = 'weather_cache_v2';

// ==================== 类型 ====================
interface CacheEntry {
  ts: number;
  lat: number;
  lon: number;
  days: WeatherDay[];
  city: string;
}

let memCache: CacheEntry | null = null;

// ==================== 工具函数 ====================

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weatherEmoji(text: string): string {
  if (text.includes('雷')) return '⛈️';
  if (text.includes('雪')) return '❄️';
  if (text.includes('雨')) return '🌧️';
  if (text.includes('雾') || text.includes('霾')) return '🌫️';
  if (text.includes('沙尘')) return '🌪️';
  if (text.includes('晴')) return '☀️';
  if (text.includes('多云')) return '⛅';
  if (text.includes('阴')) return '☁️';
  return '🌤️';
}

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

async function apiFetch(path: string, timeoutMs = 10000): Promise<any> {
  const url = `${API_HOST}${path}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'X-QW-Api-Key': API_KEY },
    });
    const json = await res.json();
    return json;
  } finally {
    clearTimeout(timer);
  }
}

// ==================== 核心逻辑 ====================

/**
 * 获取天气数据
 * 1. 并行请求 /v7/weather/now（实况）和 /v7/weather/3d（3天预报）
 * 2. 以预报数据为主体，今天的条目叠加实况的当前温度
 * 3. 并行请求 GeoAPI 获取城市名
 */
export async function getWeather(lat: number, lon: number): Promise<{ weather: WeatherDay[]; city: string }> {
  // --- 缓存检查 ---
  const cached = checkCache(lat, lon);
  if (cached) {
    return { weather: cached.days, city: cached.city };
  }

  // --- 网络请求 ---
  const loc = `${lon.toFixed(2)},${lat.toFixed(2)}`;

  try {
    const [nowJson, forecastJson, city] = await Promise.all([
      apiFetch(`/v7/weather/now?location=${loc}&lang=zh`),
      apiFetch(`/v7/weather/3d?location=${loc}&lang=zh`),
      fetchCityName(loc),
    ]);

    // 校验返回码
    if (nowJson.code !== '200') throw new Error(`now API error: ${nowJson.code}`);
    if (forecastJson.code !== '200') throw new Error(`forecast API error: ${forecastJson.code}`);

    // --- 解析实况 ---
    const now = nowJson.now;
    const nowTemp = now ? safeNum(now.temp) : 0;
    const nowHumidity = now ? safeNum(now.humidity, 60) : 60;
    const nowWind = now ? safeNum(now.windSpeed) : 0;
    const nowPrecip = now ? safeNum(now.precip) : 0;

    // --- 解析3天预报 ---
    const todayStr = localDateStr(new Date());
    const month = new Date().getMonth() + 1;
    const days: WeatherDay[] = [];

    const forecastList = forecastJson.daily || [];

    for (const fc of forecastList) {
      const dateStr: string = fc.fxDate;
      const maxT = safeNum(fc.tempMax);
      const minT = safeNum(fc.tempMin);
      const avgT = (maxT + minT) / 2;
      const fcWind = safeNum(fc.windSpeedDay);
      const fcHumidity = safeNum(fc.humidity, 60);
      const fcPrecip = safeNum(fc.precip);
      const isToday = dateStr === todayStr;

      const day: WeatherDay = {
        date: dateStr,
        tempMax: maxT,         // ← 来自预报，不是当前温度
        tempMin: minT,         // ← 来自预报，不是当前温度
        textDay: fc.textDay || '未知',
        iconDay: weatherEmoji(fc.textDay || ''),
        windSpeed: isToday ? nowWind : fcWind,
        humidity: isToday ? nowHumidity : fcHumidity,
        precip: isToday ? nowPrecip : fcPrecip,
        waterTemp: estimateWaterTemp(avgT, fcWind, month),
      };

      // 今天额外叠加实况
      if (isToday && now) {
        day.currentTemp = nowTemp;
        day.currentWaterTemp = estimateWaterTemp(nowTemp, nowWind, month);
      }

      days.push(day);
    }

    if (days.length === 0) {
      return { weather: mockWeather(), city };
    }

    // --- 写缓存 ---
    const entry: CacheEntry = { ts: Date.now(), lat, lon, days, city };
    memCache = entry;
    setSetting(CACHE_KEY, JSON.stringify(entry)).catch(() => {});
    return { weather: days, city };
  } catch (err) {
    return { weather: mockWeather(), city: '未知位置' };
  }
}

// ==================== 城市名 ====================

async function fetchCityName(loc: string): Promise<string> {
  try {
    const json = await apiFetch(`/geo/v2/city/lookup?location=${loc}&lang=zh&number=1`);
    if (json.code === '200' && json.location?.[0]) {
      const name = json.location[0].adm2 || json.location[0].name || '未知位置';
      return name;
    }
  } catch (e) {
    // 城市名查询失败，返回默认值
  }
  return '未知位置';
}

export async function getCityName(lat: number, lon: number): Promise<string> {
  if (memCache?.city) return memCache.city;
  return fetchCityName(`${lon.toFixed(2)},${lat.toFixed(2)}`);
}

// ==================== 缓存 ====================

function checkCache(lat: number, lon: number): CacheEntry | null {
  // 内存缓存
  if (memCache && Math.abs(memCache.lat - lat) < 0.01 && Math.abs(memCache.lon - lon) < 0.01 && Date.now() - memCache.ts < CACHE_TTL) {
    return memCache;
  }
  // DB 缓存（同步返回 null，异步填充由下次调用命中）
  return null;
}

// 启动时预热 DB 缓存
(async () => {
  try {
    const raw = await getSetting(CACHE_KEY);
    if (raw) {
      const parsed: CacheEntry = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL) {
        memCache = parsed;
      }
    }
  } catch (e) {
    // DB cache warmup failure is non-critical; will retry on next fetch
  }
})();

// ==================== Mock 数据 ====================

function mockWeather(): WeatherDay[] {
  const now = new Date();
  const month = now.getMonth() + 1;
  const mocks = [
    { max: 25, min: 18, text: '多云', wind: 10, hum: 65, cur: 22 },
    { max: 27, min: 19, text: '晴', wind: 8, hum: 55 },
    { max: 23, min: 17, text: '小雨', wind: 15, hum: 80, precip: 5 },
  ];
  return mocks.map((m, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const avg = (m.max + m.min) / 2;
    const day: WeatherDay = {
      date: localDateStr(d),
      tempMax: m.max,
      tempMin: m.min,
      textDay: m.text,
      iconDay: weatherEmoji(m.text),
      windSpeed: m.wind,
      humidity: m.hum,
      precip: m.precip ?? 0,
      waterTemp: estimateWaterTemp(avg, m.wind, month),
    };
    if (i === 0 && m.cur) {
      day.currentTemp = m.cur;
      day.currentWaterTemp = estimateWaterTemp(m.cur, m.wind, month);
    }
    return day;
  });
}

// ==================== 导出 ====================

export function formatDate(dateStr: string): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateStr === localDateStr(today)) return '今天';
  if (dateStr === localDateStr(tomorrow)) return '明天';

  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}月${parseInt(d)}日`;
}
