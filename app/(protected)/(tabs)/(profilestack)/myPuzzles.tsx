import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyPuzzlesScreen() {
  const puzzles = ["Puzzle One", "Puzzle Two", "Puzzle Three", "Puzzle Four"];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={puzzles}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.puzzleItem}>
            <Text style={styles.puzzleText}>{item}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },
  puzzleItem: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 10,
  },
  puzzleText: { fontSize: 16, fontWeight: "bold" },
});