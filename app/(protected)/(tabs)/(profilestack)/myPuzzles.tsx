import ProfileNavSections from "@/components/ProfileNavSections";
import { useUser } from "@/components/UserContext";
import { GeneralStyle } from "@/constants/Styles";
import { PuzzleMiniData } from "@/Firebase/DataStructures";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPuzzlesScreen() {
  const [puzzles, setPuzzles] = useState<PuzzleMiniData[]>([]);
  const {user} = useUser();

  useFocusEffect(
    useCallback(() => {
      if(user){
        setPuzzles(user.mypuzzles);
      }
    }, [user])
  );
  
  return (
    <SafeAreaView style={GeneralStyle.container}>
      <FlatList
        style={{width:'100%'}}
        data={puzzles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfileNavSections onPress={()=>{}} title={item.name}/>
        )}
      />
    </SafeAreaView>
  );
}