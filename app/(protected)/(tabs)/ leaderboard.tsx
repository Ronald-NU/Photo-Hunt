import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function LeaderboardScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Leaderboard</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}