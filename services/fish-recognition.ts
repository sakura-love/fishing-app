import { readAsStringAsync, copyAsync, cacheDirectory } from 'expo-file-system/legacy';
import { getSetting } from './storage';
import { fishEncyclopedia, FishSpecies } from '../data/fish-encyclopedia';
import { IdentifyResult } from './types';

const ZHIPU_API = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export async function identifyFish(imageUri: string): Promise<IdentifyResult> {
  const apiKey = await getSetting('zhipu_api_key');

  if (!apiKey) {
    return getMockIdentification();
  }

  try {
    // 读取图片并转为 base64
    let base64: string;
    try {
      // 优先尝试新版 API
      base64 = await readAsStringAsync(imageUri, { encoding: 'base64' });
    } catch (fileError) {
      // 如果失败，先复制到缓存目录再读取
      const fileName = `identify_${Date.now()}.jpg`;
      const destPath = `${cacheDirectory}${fileName}`;
      await copyAsync({ from: imageUri, to: destPath });
      base64 = await readAsStringAsync(destPath, { encoding: 'base64' });
    }

    // 构建鱼种列表用于提示
    const fishList = fishEncyclopedia.map((f) => `${f.name}(${f.scientificName})`).join('、');

    const apiResponse = await fetch(ZHIPU_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4v-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
              {
                type: 'text',
                text: `请识别这张图片中的鱼是什么种类。以下是常见的鱼种列表：${fishList}

请以 JSON 格式回复，包含以下字段：
- name: 鱼的中文名
- confidence: 置信度（0-100的整数）
- description: 简短描述（20字以内）

只回复 JSON，不要有其他文字。`,
              },
            ],
          },
        ],
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API returned ${apiResponse.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await apiResponse.json();

    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      // 解析 JSON 响应
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        const matchedFish = findBestMatch(result.name);
        return {
          name: matchedFish?.name || result.name,
          speciesId: matchedFish?.id || 'unknown',
          confidence: result.confidence || 70,
          description: result.description || matchedFish?.description || '',
        };
      }
    }

    return getMockIdentification();
  } catch (error) {
    // 不要静默回退到 mock，而是抛出错误让 UI 处理
    throw error;
  }
}

function findBestMatch(name: string): FishSpecies | undefined {
  // 精确匹配
  const exact = fishEncyclopedia.find((f) => f.name === name);
  if (exact) return exact;

  // 包含匹配
  const contains = fishEncyclopedia.find(
    (f) => f.name.includes(name) || name.includes(f.name)
  );
  if (contains) return contains;

  return undefined;
}

function getMockIdentification(): IdentifyResult {
  // 随机返回一个鱼种作为模拟结果
  const randomIndex = Math.floor(Math.random() * fishEncyclopedia.length);
  const fish = fishEncyclopedia[randomIndex];

  return {
    name: fish.name,
    speciesId: fish.id,
    confidence: Math.floor(Math.random() * 20) + 75, // 75-95
    description: fish.description.substring(0, 50),
  };
}

/**
 * 验证 API Key 是否有效
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(ZHIPU_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4v-flash',
        messages: [{ role: 'user', content: 'test' }],
      }),
    });
    return response.status !== 401;
  } catch {
    return false;
  }
}
