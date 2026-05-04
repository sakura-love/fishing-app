import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1a5276' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="fish/[id]" options={{ title: '鱼种详情' }} />
        <Stack.Screen name="catch/new" options={{ title: '记录钓获' }} />
        <Stack.Screen name="catch/[id]" options={{ title: '钓获详情' }} />
        <Stack.Screen name="identify" options={{ title: 'AI 识别' }} />
        <Stack.Screen name="settings/api" options={{ title: 'API 配置' }} />
      </Stack>
    </>
  );
}
