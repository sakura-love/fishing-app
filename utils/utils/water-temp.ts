/**
 * 水温估算算法
 * 基于气温、风速、季节和时间来估算水温
 * 这是一个简化模型，实际水温受多种因素影响
 */

export function estimateWaterTemp(
  airTemp: number,
  windSpeed: number,
  month: number
): number {
  // 基础水温：气温的移动平均，水温变化比气温慢
  // 夏季水温略低于气温，冬季水温略高于气温
  let baseTemp: number;

  if (month >= 6 && month <= 8) {
    // 夏季：水温约为气温的 85-90%
    baseTemp = airTemp * 0.87;
  } else if (month >= 12 || month <= 2) {
    // 冬季：水温约为气温的 110-120%（水体保温）
    baseTemp = airTemp * 1.15;
  } else {
    // 春秋季：水温约为气温的 95%
    baseTemp = airTemp * 0.95;
  }

  // 风速影响：大风会降低水温（蒸发冷却）
  const windEffect = Math.min(windSpeed * 0.1, 2);
  baseTemp -= windEffect;

  // 保留一位小数
  return Math.round(baseTemp * 10) / 10;
}

/**
 * 根据水温推荐钓鱼建议
 */
export function getFishingAdvice(waterTemp: number): string {
  if (waterTemp < 5) {
    return '水温过低，鱼活性差，建议使用小钩细线，饵料要小。';
  } else if (waterTemp < 10) {
    return '水温较低，鱼口轻，建议使用活饵，耐心守钓。';
  } else if (waterTemp < 15) {
    return '水温适中偏凉，鲫鱼、鲤鱼活跃，适合底钓。';
  } else if (waterTemp < 20) {
    return '水温适宜，多数鱼种活跃，是钓鱼的好时机！';
  } else if (waterTemp < 25) {
    return '水温舒适，鱼口旺盛，各种钓法都有效。';
  } else if (waterTemp < 30) {
    return '水温较高，建议早晚作钓，中午可钓深水或阴凉处。';
  } else {
    return '水温过高，鱼活性下降，建议钓深水或夜钓。';
  }
}

/**
 * 获取水温对应的适宜鱼种数量
 */
export function getWaterTempRating(waterTemp: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (waterTemp >= 15 && waterTemp <= 25) return 'excellent';
  if (waterTemp >= 10 && waterTemp <= 30) return 'good';
  if (waterTemp >= 5 && waterTemp <= 35) return 'fair';
  return 'poor';
}
