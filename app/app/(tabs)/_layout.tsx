import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    encyclopedia: '🐟',
    records: '📋',
    profile: '👤',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '📌'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a5276',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#1a5276' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          borderTopColor: '#eee',
          paddingBottom: 4,
          height: 56,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="encyclopedia"
        options={{
          title: '鱼图鉴',
          tabBarIcon: ({ focused }) => <TabIcon name="encyclopedia" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '钓获记录',
          tabBarIcon: ({ focused }) => <TabIcon name="records" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
