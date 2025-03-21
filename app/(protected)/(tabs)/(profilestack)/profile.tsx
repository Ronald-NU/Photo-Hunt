import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ProfileNavSections from "@/components/ProfileNavSections";
import { useUser } from "@/components/UserContext";
import { useCallback, useState } from "react";
import { GeneralStyle, TextStyles } from "@/constants/Styles";
import CreateAccountModal from "@/components/CreateAccountModal";
import { auth } from "@/Firebase/firebaseSetup";
import { colors } from "@/constants/Colors";

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

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => auth.signOut(),
        },
      ],
      { cancelable: false }
    );
  }

  const signUp = () => {
    auth.signOut();router.replace("signup");setCreatAccountModal(false);
  }

  const cancel = () => {
    router.replace("(mapstack)");setCreatAccountModal(false);
  }

  return (
    <SafeAreaView style={styles.container}>
    <CreateAccountModal isOpen={createAccountModal} 
    onSignUp={()=>{signUp()}} 
    onClose={()=>{cancel()}} />
            <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={logout}  
          >  
          <Ionicons name="exit-outline" size={30} color={colors.Black} />
          </TouchableOpacity>
<View style={styles.profileContainer}>
  <Ionicons name="person-circle" size={80} color={colors.Primary} style={styles.profileImage} />
  <Text style={styles.profileName}>{user?.name!=null?user.name:"Profile Name"}</Text>
  <Text style={TextStyles.mediumText}>{user?.code!=null?user.code:"#Friend Code"}</Text>
  <Text style={styles.scoreTitle}>Score</Text>
  <Text style={TextStyles.smallText}>{user?.score!=null?user.score:"Local Leaderboard Score"}</Text>
</View>

      {/* 按钮列表 */}
      <View>
        <ProfileNavSections title="My Puzzles" onPress={user?()=>router.push("myPuzzles"):()=>{}} />
        <ProfileNavSections title="Friends" onPress={user?()=>router.push("viewFriends"):()=>{}} />
        <ProfileNavSections title="Reminders" onPress={user?()=>router.push("reminder"):()=>{}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.White, paddingTop: 20 },
  profileContainer: { alignItems: "center", marginBottom: 20 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileName: { fontSize: 22, fontWeight: "bold" },
  scoreTitle: { marginTop: 10, fontSize: 18, fontWeight: "bold" },
  logoutButton: {    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
  },
});