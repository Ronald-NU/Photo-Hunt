import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LeaderboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Text>Leaderboard</Text>
      <Button title="Back" onPress={() => router.back()} />
    </SafeAreaView>
  );
}