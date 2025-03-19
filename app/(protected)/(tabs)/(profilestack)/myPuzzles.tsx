import { GeneralStyle } from "@/constants/Styles";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPuzzlesScreen() {
  const puzzles = ["Puzzle One", "Puzzle Two", "Puzzle Three", "Puzzle Four"];

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <FlatList
        style={{width:'100%'}}
        data={puzzles}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={GeneralStyle.profileSection}>
            <Text style={GeneralStyle.profileSectionText}>{item}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}