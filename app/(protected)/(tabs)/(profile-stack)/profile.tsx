import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Profile Screen</Text>
      <Button title="My Puzzles" onPress={() => router.push("../profile-stack/myPuzzles")} />
      <Button title="Friends" onPress={() => router.push("../profile-stack/viewFriends")} />
      <Button title="Reminders" onPress={() => router.push("../profile-stack/reminder")} />
    </View>
  );
}