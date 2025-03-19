import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ProfileNavSections from "@/components/ProfileNavSections";
import { useUser } from "@/components/UserContext";
import { useCallback, useState } from "react";
import { GeneralStyle } from "@/constants/Styles";
import CreateAccountModal from "@/components/CreateAccountModal";
import { auth } from "@/Firebase/firebaseSetup";

export default function ProfileScreen() {
  const router = useRouter();
  const {user, loading} = useUser();
  const [createAccountModal, setCreatAccountModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user == null) {
        setCreatAccountModal(true);
      } else {
        setCreatAccountModal(false);
      }
    }, [user])
  );
  if(loading){
    return (
    <SafeAreaView style={GeneralStyle.container}>
      <ActivityIndicator/>
    </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
    <CreateAccountModal isOpen={createAccountModal} onSignUp={()=>{auth.signOut();router.replace("signup");setCreatAccountModal(false);}} onClose={()=>{router.replace("(mapstack)");setCreatAccountModal(false);}} />
<View style={styles.profileContainer}>
  <Ionicons name="person-circle" size={80} color="#6200ea" style={styles.profileImage} />
  <Text style={styles.profileName}>{user?.name!=null?user.name:"Profile Name"}</Text>
  <Text style={styles.friendCode}>{user?.code!=null?user.code:"#Friend Code"}</Text>
  <Text style={styles.scoreTitle}>Score</Text>
  <Text style={styles.score}>{user?.score!=null?user.score:"Local Leaderboard Score"}</Text>
</View>

      {/* 按钮列表 */}
      <View style={styles.buttonContainer}>
        <ProfileNavSections title="My Puzzles" onPress={user?()=>router.push("myPuzzles"):()=>{}} />
        <ProfileNavSections title="Friends" onPress={user?()=>router.push("viewFriends"):()=>{}} />
        <ProfileNavSections title="Reminders" onPress={user?()=>router.push("reminder"):()=>{}} />
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