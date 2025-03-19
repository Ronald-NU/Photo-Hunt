import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewGameScreen() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Text>New Game Screen</Text>
      <Button title="Take Photo" onPress={() => router.push("camera")} />
    </SafeAreaView>
  );
}