// app/(protected)/(tabs)/(profile-stack)/profile.tsx
import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Button 
        title="My Puzzles" 
        onPress={() => router.push("/(protected)/(tabs)/(profile-stack)/myPuzzles")} 
      />
      <Button 
        title="Friends" 
        onPress={() => router.push("/(protected)/(tabs)/(profile-stack)/viewFriends")} 
      />
      <Button 
        title="Reminders" 
        onPress={() => router.push("/(protected)/(tabs)/(profile-stack)/reminder")} 
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