import { WeatherDay } from './types';
import { estimateWaterTemp } from '../utils/water-temp';
import { getSetting, setSetting } from './storage';

// 高德天气 API
const AMAP_KEY = 'ad5210f849d447b94715ff98d4da7419';
const AMAP_WEATHER_API = 'https://restapi.amap.com/v3/weather/weatherInfo';
const AMAP_GEO_API = 'https://restapi.amap.com/v3/geocode/regeo';

// 缓存有效期（毫秒）
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟

// 天气现象映射
const WEATHER_TEXT_MAP: Record<string, string> = {
  '晴': '晴',
  '多云': '多云',
  '阴': '阴天',
  '小雨': '小雨',
  '中雨': '中雨',
  '大雨': '大雨',
  '暴雨': '暴雨',
  '雷阵雨': '雷阵雨',
  '小雪': '小雪',
  '中雪': '中雪',
  '大雪': '大雪',
  '雾': '雾',
  '霾': '霾',
  '沙尘暴': '沙尘暴',
  '阵雨': '阵雨',
};

interface WeatherCache {
  timestamp: number;
  lat: number;
  lon: number;
  data: WeatherDay[];
  adcode?: string;
  city?: string;
}

let memoryCache: WeatherCache | null = null;

// 根据经纬度获取城市编码
async function getAdcode(lat: number, lon: number): Promise<{ adcode: string; city: string }> {
  try {
    const url = `${AMAP_GEO_API}?key=${AMAP_KEY}&location=${lon.toFixed(6)},${lat.toFixed(6)}&output=json`;
    console.log('[Weather] Getting adcode for:', lat, lon);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1' && data.regeocode) {
      const adcode = data.regeocode.addressComponent?.adcode;
      const district = data.regeocode.addressComponent?.district || '';
      const city = data.regeocode.addressComponent?.city || 
                   data.regeocode.addressComponent?.province || '未知位置';
      console.log('[Weather] Got adcode:', adcode, 'city:', city);
      // 优先显示区/县级地名，更具体
      const locationName = district || city;
      return { adcode, city: locationName };
    }
    
    throw new Error('Failed to get adcode');
  } catch (error) {
    console.error('[Weather] Adcode error:', error);
    throw error;
  }
}

// 查询高德天气（实况 + 预报）
async function queryAmapWeather(adcode: string): Promise<WeatherDay[]> {
  try {
    // 同时请求实况和预报
    const baseUrl = `${AMAP_WEATHER_API}?key=${AMAP_KEY}&city=${adcode}`;
    
    console.log('[Weather] Fetching weather for adcode:', adcode);
    
    // 并行请求实况和预报
    const [liveRes, forecastRes] = await Promise.all([
      fetch(`${baseUrl}&extensions=base&output=json`),
      fetch(`${baseUrl}&extensions=all&output=json`)
    ]);
    
    const liveData = await liveRes.json();
    const forecastData = await forecastRes.json();
    
    console.log('[Weather] Live status:', liveData.status, 'Forecast status:', forecastData.status);
    
    const days: WeatherDay[] = [];
    
    // 解析实况天气
    if (liveData.status === '1' && liveData.lives?.[0]) {
      const live = liveData.lives[0];
      const currentTemp = parseFloat(live.temperature) || 0;
      const currentHumidity = parseFloat(live.humidity) || 60;
      const windSpeed = convertWindPowerToSpeed(live.windpower);
      const month = new Date().getMonth() + 1;
      
      console.log('[Weather] Live temp:', currentTemp, 'humidity:', currentHumidity);
      
      // 今天数据（实况）
      days.push({
        date: new Date().toISOString().split('T')[0],
        tempMax: currentTemp,
        tempMin: currentTemp,
        textDay: live.weather || '未知',
        iconDay: getWeatherIcon(live.weather || ''),
        windSpeed,
        humidity: currentHumidity,
        precip: 0,
        waterTemp: estimateWaterTemp(currentTemp, windSpeed, month),
        currentTemp,
        currentWaterTemp: estimateWaterTemp(currentTemp, windSpeed, month),
      });
    }
    
    // 解析预报天气
    if (forecastData.status === '1' && forecastData.forecasts?.[0]) {
      const forecast = forecastData.forecasts[0];
      const month = new Date().getMonth() + 1;
      
      // 跳过今天（已有实况），取明后天
      for (let i = 1; i < forecast.casts.length && days.length < 3; i++) {
        const cast = forecast.casts[i];
        const tempMax = parseFloat(cast.daytemp) || 0;
        const tempMin = parseFloat(cast.nighttemp) || 0;
        const avgTemp = (tempMax + tempMin) / 2;
        const windSpeed = convertWindPowerToSpeed(cast.daypower);
        
        days.push({
          date: cast.date,
          tempMax,
          tempMin,
          textDay: cast.dayweather || '未知',
          iconDay: getWeatherIcon(cast.dayweather || ''),
          windSpeed,
          humidity: 60, // 预报不提供湿度
          precip: 0,
          waterTemp: estimateWaterTemp(avgTemp, windSpeed, month),
        });
      }
    }
    
    return days.length > 0 ? days : getMockWeather();
  } catch (error) {
    console.error('[Weather] Query error:', error);
    return getMockWeather();
  }
}

// 风力等级转风速 (km/h)
function convertWindPowerToSpeed(power: string): number {
  const level = parseInt(power) || 0;
  // 大致转换：1级=1km/h, 2级=3km/h, 3级=6km/h...
  const speeds = [0, 1, 3, 6, 10, 15, 21, 28, 36, 44, 54, 64, 75];
  return speeds[Math.min(level, 12)] || 0;
}

function getWeatherIcon(text: string): string {
  if (text.includes('晴')) return '☀️';
  if (text.includes('多云')) return '⛅';
  if (text.includes('阴')) return '☁️';
  if (text.includes('雨')) return '🌧️';
  if (text.includes('雪')) return '❄️';
  if (text.includes('雾') || text.includes('霾')) return '🌫️';
  if (text.includes('雷')) return '⛈️';
  if (text.includes('沙尘')) return '🌪️';
  return '🌤️';
}

export async function getWeather(lat: number, lon: number): Promise<WeatherDay[]> {
  // 检查内存缓存
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

  try {
    // 先获取城市编码
    const { adcode, city } = await getAdcode(lat, lon);
    
    // 查询天气
    const weatherDays = await queryAmapWeather(adcode);
    
    // 缓存结果
    const cacheObj: WeatherCache = {
      timestamp: Date.now(),
      lat,
      lon,
      data: weatherDays,
      adcode,
      city,
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

// 导出获取城市名称的函数
export async function getCityName(lat: number, lon: number): Promise<string> {
  try {
    if (memoryCache?.city) return memoryCache.city;
    const { city } = await getAdcode(lat, lon);
    return city;
  } catch {
    return '未知位置';
  }
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

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateStr === today.toISOString().split('T')[0]) return '今天';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return '明天';

  return `${date.getMonth() + 1}月${date.getDate()}日`;
}