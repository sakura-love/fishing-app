/**
 * API Key 配置工具
 * 天气 API Key 通过此模块提供（预配置，简单混淆）
 * 智谱 AI Key 由用户在 app 内的 设置 -> API 配置 页面自行输入
 * 
 * 注意：XOR 混淆仅防止简单扫描，不是真正的安全加密
 */

// 简单的 XOR 混淆密钥（不是真正的加密，但足以防止简单扫描）
const OBFUSCATION_KEY = 'fishing-app-2025';

/**
 * 将明文 Key 编码为混淆后的字符串
 * 仅用于开发时生成混淆值，生产环境中不应调用
 */
export function obfuscateKey(plainKey: string): string {
  const encoded: number[] = [];
  for (let i = 0; i < plainKey.length; i++) {
    const charCode = plainKey.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    encoded.push(charCode);
  }
  return encoded.map(n => n.toString(36).padStart(3, '0')).join('');
}

/**
 * 将混淆后的字符串解码为明文 Key
 * 运行时使用此函数获取真实 Key
 */
export function deobfuscateKey(obfuscated: string): string {
  const encoded: number[] = [];
  for (let i = 0; i < obfuscated.length; i += 3) {
    encoded.push(parseInt(obfuscated.substring(i, i + 3), 36));
  }
  let decoded = '';
  for (let i = 0; i < encoded.length; i++) {
    const charCode = encoded[i] ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    decoded += String.fromCharCode(charCode);
  }
  return decoded;
}

// 预混淆的和风天气 API Key
// 原始 Key 永远不会出现在生产代码中
export const OBFUSCATED_WEATHER_KEY = '02802i00l00e02k02i02800l02d00h02102400600802b00700702i01z00e00b00802n00s02a00i01z00s02c02b002002';

/**
 * 获取和风天气 API Key
 */
export function getWeatherApiKey(): string {
  return deobfuscateKey(OBFUSCATED_WEATHER_KEY);
}