import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/Colors";
import { NavStyle } from "@/constants/Styles";

export default function BottomTabNavigator() {
  return (
    <Tabs screenOptions={{ headerShown: false, 
    tabBarActiveTintColor:colors.Primary, 
    tabBarStyle: NavStyle.tabBar
    }}>
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