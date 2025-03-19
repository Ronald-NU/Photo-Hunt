// app/(protected)/(tabs)/(newGame-stack)/newGame.tsx
import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";

export default function NewGameScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Game Screen</Text>
      <Button 
        title="Take Photo" 
        onPress={() => router.push("/(protected)/(tabs)/(newGame-stack)/camera")} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});