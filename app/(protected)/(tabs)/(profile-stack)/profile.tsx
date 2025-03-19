import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
<View style={styles.profileContainer}>
  <Ionicons name="person-circle" size={80} color="#6200ea" style={styles.profileImage} />
  <Text style={styles.profileName}>Profile Name</Text>
  <Text style={styles.friendCode}>#Friend Code</Text>
  <Text style={styles.scoreTitle}>Score</Text>
  <Text style={styles.score}>Your Local Leaderboard Score</Text>
</View>

      {/* 按钮列表 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/(protected)/(profile-stack)/myPuzzles")}>
          <Text style={styles.buttonText}>My Puzzles</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/(protected)/(profile-stack)/viewFriends")}>
          <Text style={styles.buttonText}>Friends</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/(protected)/(profile-stack)/reminder")}>
          <Text style={styles.buttonText}>Reminders</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingTop: 20 },
  profileContainer: { alignItems: "center", marginBottom: 20 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileName: { fontSize: 22, fontWeight: "bold" },
  friendCode: { fontSize: 16, color: "gray" },
  scoreTitle: { marginTop: 10, fontSize: 18, fontWeight: "bold" },
  score: { fontSize: 14, color: "gray" },
  buttonContainer: { marginTop: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  buttonText: { fontSize: 16, fontWeight: "bold" },
});