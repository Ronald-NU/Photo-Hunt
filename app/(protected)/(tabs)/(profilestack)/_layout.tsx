import { Stack } from "expo-router";

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="profile" 
        options={{ title: "Profile", headerShown: false }} 
      />
      <Stack.Screen 
        name="myPuzzles" 
        options={{ title: "My Puzzles" }} 
      />
      <Stack.Screen 
        name="viewFriends" 
        options={{ title: "Friends" }} 
      />
      <Stack.Screen 
        name="reminder" 
        options={{ title: "Reminders" }} 
      />
    </Stack>
  );
}