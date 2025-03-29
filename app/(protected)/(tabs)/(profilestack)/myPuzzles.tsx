import ProfileNavSections from "@/components/ProfileNavSections";
import { useUser } from "@/components/UserContext";
import { GeneralStyle } from "@/constants/Styles";
import { PuzzleMiniData } from "@/Firebase/DataStructures";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPuzzlesScreen() {
  const [puzzles, setPuzzles] = useState<PuzzleMiniData[]>([]);
  const {user} = useUser();

  const getDifficultyText = (difficulty: number) => {
    switch(difficulty) {
      case 3: return "Easy";
      case 4: return "Medium";
      case 5: return "Hard";
      default: return "Unknown";
    }
  };

  useFocusEffect(
    useCallback(() => {
      if(user){
        setPuzzles(user.mypuzzles);
      }
    }, [user])
  );
  
  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Text style={styles.title}>My Created Puzzles</Text>
      <FlatList
        style={{width:'100%'}}
        data={puzzles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.puzzleItem}>
            <Text style={styles.puzzleName}>{item.name}</Text>
            <Text style={styles.difficulty}>{getDifficultyText(item.difficulty)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center'
  },
  puzzleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  puzzleName: {
    fontSize: 18,
    fontWeight: '500',
  },
  difficulty: {
    fontSize: 16,
    color: '#666',
  }
});