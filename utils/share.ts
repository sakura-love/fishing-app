import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { View } from 'react-native';

export async function shareView(viewRef: RefObject<View | null>): Promise<boolean> {
  try {
    if (!viewRef.current) return false;

    const uri = await captureRef(viewRef as any, {
      format: 'png',
      quality: 1,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) return false;

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: '分享钓获记录',
    });

    return true;
  } catch {
    return false;
  }
}

export function generateShareText(
  fishName: string,
  length?: number,
  weight?: number,
  location?: string
): string {
  let text = `🎣 我钓到了一条 ${fishName}！`;

  if (length !== undefined) text += `\n📏 长度: ${length}cm`;
  if (weight !== undefined) text += `\n⚖️ 重量: ${weight}kg`;
  if (location) text += `\n📍 地点: ${location}`;

  text += '\n\n来自《钓鱼人宝典》';

  return text;
}
