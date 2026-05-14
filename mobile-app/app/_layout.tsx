import { Tabs } from 'expo-router';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
        <Tabs.Screen name="index" options={{ title: 'Dashboard', headerShown: false, tabBarIcon: ({color}) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} /> }} />
        <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({color}) => <MaterialCommunityIcons name="map" size={24} color={color} /> }} />
        <Tabs.Screen name="logs" options={{ title: 'Logs', tabBarIcon: ({color}) => <MaterialCommunityIcons name="console" size={24} color={color} /> }} />
        <Tabs.Screen name="actions" options={{ title: 'Actions', tabBarIcon: ({color}) => <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color={color} /> }} />
        <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: ({color}) => <MaterialCommunityIcons name="bell" size={24} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({color}) => <MaterialCommunityIcons name="account" size={24} color={color} /> }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({color}) => <MaterialCommunityIcons name="cog" size={24} color={color} /> }} />
        
        {/* Hide screens from bottom tab bar that are only navigated to sequentially */}
        <Tabs.Screen name="crisis" options={{ title: 'Crisis Details', href: null }} />
        <Tabs.Screen name="outcome" options={{ title: 'Outcome', href: null }} />
      </Tabs>
    </PaperProvider>
  );
}
