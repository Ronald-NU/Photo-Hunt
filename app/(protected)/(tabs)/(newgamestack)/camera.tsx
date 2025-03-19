import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function CameraScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Camera Screen</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}