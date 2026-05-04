import { WeatherDay } from './types';
import { estimateWaterTemp } from '../utils/water-temp';

// Open-Meteo 免费天气 API（无需 API Key）
const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

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

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    windspeed_10m_max: number[];
    precipitation_sum: number[];
    relative_humidity_2m_max?: number[];
  };
}

export async function getWeather(lat: number, lon: number): Promise<WeatherDay[]> {
  try {
    const url = `${OPEN_METEO_API}?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,precipitation_sum` +
      `&hourly=relative_humidity_2m` +
      `&timezone=auto&forecast_days=3`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Open-Meteo API error:', response.status);
      return getMockWeather();
    }

    const data: OpenMeteoResponse = await response.json();

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.error('Open-Meteo: empty response');
      return getMockWeather();
    }

    const now = new Date();
    const month = now.getMonth() + 1;

    // 计算每日平均湿度（从小时数据中提取）
    const dailyHumidity = calculateDailyHumidity(data);

    return data.daily.time.map((date, index) => {
      const tempMax = Math.round(data.daily.temperature_2m_max[index]);
      const tempMin = Math.round(data.daily.temperature_2m_min[index]);
      const avgTemp = (tempMax + tempMin) / 2;
      const windSpeed = Math.round(data.daily.windspeed_10m_max[index]);
      const weatherCode = data.daily.weathercode[index];
      const precip = data.daily.precipitation_sum[index] || 0;
      const humidity = dailyHumidity[index] || 60;

      return {
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
    });
  } catch (error) {
    console.error('Weather fetch error:', error);
    return getMockWeather();
  }
}

function calculateDailyHumidity(data: OpenMeteoResponse): number[] {
  // 如果有小时级湿度数据，计算每天的平均值
  if ((data as any).hourly?.relative_humidity_2m) {
    const hourly = (data as any).hourly.relative_humidity_2m as number[];
    const dailyAvg: number[] = [];
    for (let i = 0; i < 3 && i * 24 < hourly.length; i++) {
      const dayHours = hourly.slice(i * 24, (i + 1) * 24);
      const avg = Math.round(dayHours.reduce((a, b) => a + b, 0) / dayHours.length);
      dailyAvg.push(avg);
    }
    return dailyAvg;
  }
  return [60, 55, 65]; // 默认值
}

function getWeatherIconFromCode(code: number, precip: number): string {
  // 根据 WMO 天气代码返回 emoji
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
    { tempMax: 25, tempMin: 18, textDay: '多云', windSpeed: 10, humidity: 65, precip: 0 },
    { tempMax: 27, tempMin: 19, textDay: '晴', windSpeed: 8, humidity: 55, precip: 0 },
    { tempMax: 23, tempMin: 17, textDay: '小雨', windSpeed: 15, humidity: 80, precip: 5 },
  ];

  return mockDays.map((mock, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    const avgTemp = (mock.tempMax + mock.tempMin) / 2;

    return {
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