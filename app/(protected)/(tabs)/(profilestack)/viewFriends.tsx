import ProfileNavSections from "@/components/ProfileNavSections";
import { GeneralStyle } from "@/constants/Styles";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ViewFriendsScreen() {
  const friends = ["Friend One", "Friend Two", "Friend Three", "Friend Four"];
  return (
    <SafeAreaView style={GeneralStyle.container}>
      <FlatList
        style={{width:'100%'}}
        data={friends}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <ProfileNavSections onPress={()=>{}} title={item}/>
        )}
      />
    </SafeAreaView>
  );
}