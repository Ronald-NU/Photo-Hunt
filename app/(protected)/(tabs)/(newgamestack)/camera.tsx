import { useRouter } from "expo-router";
import { View, Text, Button, SafeAreaView } from "react-native";

export default function CameraScreen() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Text>Camera Screen</Text>
      <Button title="Back" onPress={() => router.back()} />
    </SafeAreaView>
  );
}