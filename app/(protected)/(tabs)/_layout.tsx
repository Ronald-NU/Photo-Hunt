import { Ionicons } from '@expo/vector-icons';

import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} initialRouteName="(mapstack)">
      <Tabs.Screen
        name="(newgamestack)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          title: "New Game",
        }}
      />
      <Tabs.Screen
        name="(mapstack)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          title: "Map",
        }}
      />
      <Tabs.Screen
        name="(profilestack)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          title: "Profile",
        }}
      />
    </Tabs>
  );
}