import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ProfileNavSections from "@/components/ProfileNavSections";

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
        <ProfileNavSections title="My Puzzles" onPress={()=>router.push("myPuzzles")} />
        <ProfileNavSections title="Friends" onPress={()=>router.push("viewFriends")} />
        <ProfileNavSections title="Reminders" onPress={()=>router.push("reminder")} />
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
});