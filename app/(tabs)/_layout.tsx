import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { Colors } from '@/constants/Colors'

function TabIcon({ symbol, label, focused }: { symbol: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2, paddingTop: 4 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{symbol}</Text>
      <Text style={{
        fontSize: 10,
        color: focused ? Colors.accent : Colors.muted,
        fontWeight: focused ? '600' : '400',
      }}>
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.sidebar,
          borderTopColor: Colors.border,
          height: 64,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Поток',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◎" label="Поток" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Память',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◈" label="Память" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Проекты',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◧" label="Проекты" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="artifacts"
        options={{
          title: 'Артефакты',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◫" label="Артефакты" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Карта',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⊙" label="Карта" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="adjna"
        options={{
          title: 'Аджна',
          tabBarIcon: ({ focused }) => <TabIcon symbol="✦" label="Аджна" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
