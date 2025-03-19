import { Stack } from "expo-router";

export default function NewGameStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Map", headerShown: false }} />
      <Stack.Screen name="leaderboard" options={{ title: "Leaderboard", headerShown: false }} />
    </Stack>
  );
}