<<<<<<< HEAD
import { Ionicons } from '@expo/vector-icons';

import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} initialRouteName="(mapstack)">
      <Tabs.Screen
        name="(newgamestack)"
=======
// app/(protected)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(newGame-stack)"
>>>>>>> 383b733 (Refactor tab navigation and screens)
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          title: "New Game",
        }}
      />
      <Tabs.Screen
<<<<<<< HEAD
        name="(mapstack)"
=======
        name="index"
>>>>>>> 383b733 (Refactor tab navigation and screens)
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          title: "Map",
        }}
      />
      <Tabs.Screen
<<<<<<< HEAD
        name="(profilestack)"
=======
        name="(profile-stack)"
>>>>>>> 383b733 (Refactor tab navigation and screens)
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          title: "Profile",
        }}
      />
<<<<<<< HEAD
=======
      
      {/* Use one approach or the other, not both */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarButton: () => null,
        }}
      />
>>>>>>> 383b733 (Refactor tab navigation and screens)
    </Tabs>
  );
}