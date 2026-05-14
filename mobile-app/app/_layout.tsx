import { Tabs } from 'expo-router';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Layout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <Tabs screenOptions={{ headerShown: true, tabBarActiveTintColor: theme.colors.primary }}>
        <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({color}) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} /> }} />
        <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({color}) => <MaterialCommunityIcons name="map" size={24} color={color} /> }} />
        <Tabs.Screen name="logs" options={{ title: 'Logs', tabBarIcon: ({color}) => <MaterialCommunityIcons name="console" size={24} color={color} /> }} />
        <Tabs.Screen name="actions" options={{ title: 'Actions', tabBarIcon: ({color}) => <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color={color} /> }} />
        <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: ({color}) => <MaterialCommunityIcons name="bell" size={24} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({color}) => <MaterialCommunityIcons name="account" size={24} color={color} /> }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({color}) => <MaterialCommunityIcons name="cog" size={24} color={color} /> }} />
      </Tabs>
    </PaperProvider>
  );
}
