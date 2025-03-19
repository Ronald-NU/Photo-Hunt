// app/(protected)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from './index';
import NewGameScreen from './(newGame-stack)/newGame';
import ProfileScreen from './(profile-stack)/profile';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(newGame-stack)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          title: "New Game",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          title: "Map",
        }}
      />
      <Tabs.Screen
        name="(profile-stack)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          title: "Profile",
        }}
      />
      
      {/* Use one approach or the other, not both */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}