import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Profile Screen</Text>
      <Button title="My Puzzles" onPress={() => router.push("myPuzzles")} />
      <Button title="Friends" onPress={() => router.push("viewFriends")} />
      <Button title="Reminders" onPress={() => router.push("reminder")} />
    </View>
  );
}