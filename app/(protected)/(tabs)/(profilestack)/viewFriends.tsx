import ProfileNavSections from "@/components/ProfileNavSections";
import { useUser } from "@/components/UserContext";
import { GeneralStyle } from "@/constants/Styles";
import { FriendMiniData } from "@/Firebase/DataStructures";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ViewFriendsScreen() {
  const [friends, setFriends] = useState<FriendMiniData[]>([]);
  const {user} = useUser();

  useFocusEffect(
    useCallback(() => {
      if(user){
        setFriends(user.friends);
      }
    }, [user])
  );

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <FlatList
        style={{width:'100%'}}
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfileNavSections onPress={()=>{}} title={item.name}/>
        )}
      />
    </SafeAreaView>
  );
}