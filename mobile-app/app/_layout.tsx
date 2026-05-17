import { Tabs } from 'expo-router';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const createTabIcon = (name: IconName) => ({ color }: { color: string }) => (
  <MaterialCommunityIcons name={name} size={24} color={color} />
);

const dashboardIcon = createTabIcon('view-dashboard');
const mapIcon = createTabIcon('map');
const logsIcon = createTabIcon('console');
const actionsIcon = createTabIcon('checkbox-marked-circle-outline');
const alertsIcon = createTabIcon('bell');
const profileIcon = createTabIcon('account');
const settingsIcon = createTabIcon('cog');

export default function Layout() {
  return (
    <PaperProvider theme={MD3DarkTheme}>
      <StatusBar style="light" />
      <Tabs 
        screenOptions={{ 
          headerShown: true, 
          tabBarActiveTintColor: MD3DarkTheme.colors.primary,
          tabBarStyle: { backgroundColor: '#121212', borderTopColor: '#333' },
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#ffffff',
          sceneStyle: { backgroundColor: '#121212' }
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Dashboard', headerShown: false, tabBarIcon: dashboardIcon }} />
        <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: mapIcon }} />
        <Tabs.Screen name="logs" options={{ title: 'Logs', tabBarIcon: logsIcon }} />
        <Tabs.Screen name="actions" options={{ title: 'Actions', tabBarIcon: actionsIcon }} />
        <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: alertsIcon }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: profileIcon }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: settingsIcon }} />
        
        {/* Hide screens from bottom tab bar that are only navigated to sequentially */}
        <Tabs.Screen name="crisis" options={{ title: 'Crisis Details', href: null }} />
        <Tabs.Screen name="outcome" options={{ title: 'Outcome', href: null }} />
      </Tabs>
    </PaperProvider>
  );
}
