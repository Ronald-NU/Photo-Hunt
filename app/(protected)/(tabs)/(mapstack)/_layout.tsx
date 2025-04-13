import { Stack } from "expo-router";

export default function MapStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Map", headerShown: false }} />
      <Stack.Screen name="leaderboard" options={{ title: "Leaderboard",  headerShown: true,
          headerBackTitle: "Back"
        }} />
      <Stack.Screen 
        name="puzzle" 
        options={{ 
          title: "Puzzle",
          headerShown: true,
          headerBackTitle: "Back to Map"
        }} 
      />
      <Stack.Screen name="validateCamera" options={{ title: "Verify Completion", headerShown: true, headerBackTitle: "Back" }} />
    </Stack>
  );
}