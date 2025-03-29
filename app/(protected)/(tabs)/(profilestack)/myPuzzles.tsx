import { useUser } from "@/components/UserContext";
import { GeneralStyle } from "@/constants/Styles";
import { PuzzleMiniData, PuzzleData } from "@/Firebase/DataStructures";
import { useFocusEffect, useRouter, Stack } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPuzzleData } from "@/Firebase/firebaseHelperPuzzles";

export default function MyPuzzlesScreen() {
  const [puzzles, setPuzzles] = useState<PuzzleMiniData[]>([]);
  const {user} = useUser();
  const router = useRouter();

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
      if(user?.mypuzzles){
        setPuzzles(user.mypuzzles);
      }
    }, [user])
  );

  const handlePuzzlePress = async (puzzle: PuzzleMiniData) => {
    try {
      const result = await getPuzzleData(puzzle.id);
      const puzzleData = result as PuzzleData;
      
      if (puzzleData && puzzleData.photoURL) {
        router.push({
          pathname: "/(protected)/(tabs)/(newgamestack)/puzzle",
          params: {
            imageUri: puzzleData.photoURL,
            difficulty: getDifficultyText(puzzleData.difficulty),
            locationName: puzzleData.name,
            latitude: puzzleData.geoLocation.latitude.toString(),
            longitude: puzzleData.geoLocation.longitude.toString(),
            isViewMode: "true"
          }
        });
      }
    } catch (error) {
      console.error("Error loading puzzle:", error);
    }
  };
  
  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Stack.Screen options={{ title: "My Puzzles" }} />
      <FlatList
        style={styles.list}
        data={puzzles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.puzzleItem}
            onPress={() => handlePuzzlePress(item)}
          >
            <Text style={styles.puzzleName}>{item.name}</Text>
            <Text style={styles.difficulty}>{getDifficultyText(item.difficulty)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No puzzles created yet</Text>
            <Text style={styles.emptySubText}>Create a new puzzle to see it here!</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    padding: 15,
  },
  puzzleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
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
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});