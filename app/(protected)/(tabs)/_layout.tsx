import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { SelectedLocationContext } from "@/components/SelectedLocationContext";
import { Alert } from "react-native";

export default function TabLayout() {
  const { selectedLocation } = useContext(SelectedLocationContext);

  const handleNewGamePress = () => {
    if (!selectedLocation) {
      Alert.alert(
        "Select Location",
        "Please tap on the map to select a location first",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00A9E0",
      }}
    >
      <Tabs.Screen
        name="(newgamestack)"
        options={{
          title: "New Game",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={30} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!handleNewGamePress()) {
              e.preventDefault();
            }
          },
        }}
      />
      <Tabs.Screen
        name="(mapstack)"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profilestack)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}