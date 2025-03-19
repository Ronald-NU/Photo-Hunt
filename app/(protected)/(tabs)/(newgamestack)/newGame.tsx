import TouchableButton from "@/components/TouchableButton";
import { GeneralStyle } from "@/constants/Styles";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewGameScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Text style={GeneralStyle.title}>New Game</Text>
      <TouchableButton
        title="Take Photo"
        onPress={() => router.push("camera")}
      />
    </SafeAreaView>
  );
}