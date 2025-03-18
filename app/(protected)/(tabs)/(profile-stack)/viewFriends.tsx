import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function MyPuzzlesScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>My Puzzles</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}