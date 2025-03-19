import { Stack } from "expo-router";

export default function NewGameStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="newGame" options={{ title: "New Game", headerShown: false }} />
      <Stack.Screen name="camera" options={{ title: "Take Photo" }} />
    </Stack>
  );
}