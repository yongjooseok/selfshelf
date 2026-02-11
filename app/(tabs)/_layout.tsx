import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, FONT_SIZE } from '../../src/utils/constants';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSub,
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.home'),
          tabBarIcon: ({ color }) => (
            <TabIcon icon="shelf" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('tab.scan'),
          tabBarIcon: ({ color }) => (
            <TabIcon icon="scan" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tab.history'),
          tabBarIcon: ({ color }) => (
            <TabIcon icon="history" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tab.settings'),
          tabBarIcon: ({ color }) => (
            <TabIcon icon="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// 간단한 텍스트 아이콘 (Week 2+에서 아이콘 라이브러리로 교체 가능)
function TabIcon({ icon, color }: { icon: string; color: string }) {
  const { Text } = require('react-native');
  const icons: Record<string, string> = {
    shelf: '🏠',
    scan: '📷',
    history: '📋',
    settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: 20, color }}>
      {icons[icon] ?? '?'}
    </Text>
  );
}
