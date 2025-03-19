import { useRouter } from "expo-router";
import { View, Text, Button, SafeAreaView } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Text>Profile Screen</Text>
      <Button title="My Puzzles" onPress={() => router.push("myPuzzles")} />
      <Button title="Friends" onPress={() => router.push("viewFriends")} />
      <Button title="Reminders" onPress={() => router.push("reminder")} />
    </SafeAreaView>
  );
}