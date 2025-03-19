import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function NewGameScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>New Game Screen</Text>
      <Button title="Take Photo" onPress={() => router.push("../newGame-stack/camera")} />
    </View>
  );
}