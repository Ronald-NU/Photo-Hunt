import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { PuzzleData, PuzzleMiniData, UserData } from '@/Firebase/DataStructures';
import { getPuzzleData } from '@/Firebase/firebaseHelperPuzzles';
import { getFriend } from '@/Firebase/firebaseHelperUsers';

export default function FriendPuzzleScreen() {
const [puzzles, setPuzzles] = useState<PuzzleMiniData[]>([]);
 const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getDifficultyText = (difficulty: number) => {
    switch(difficulty) {
      case 3: return "Easy";
      case 4: return "Medium";
      case 5: return "Hard";
      default: return "Unknown";
    }
  };

  const fetchUserPuzzles = useCallback(async () => {
    
    if (!params.code) return;
    console.log(params.code);
    setIsLoading(true);
    try {
      // Get fresh user data from the database
      const userData = await getFriend(params.code as string) as UserData;
      console.log(userData);
      if (userData && userData.mypuzzles) {
        setPuzzles(userData.mypuzzles);
      } else {
        setPuzzles([]);
      }
    } catch (error) {
      console.error("Error fetching user puzzles:", error);
      Alert.alert("Error", "Failed to load your puzzles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [params.code]);

  useFocusEffect(
    useCallback(() => {
      fetchUserPuzzles();
    }, [fetchUserPuzzles])
  );

  const handlePuzzlePress = async (puzzle: PuzzleMiniData) => {
    try {
      const result = await getPuzzleData(puzzle.id);
      if (!result) {
        Alert.alert("Error", "Could not find puzzle data.");
        return;
      }

      const puzzleData = result as PuzzleData;
      if (!puzzleData.photoURL) {
        Alert.alert("Error", "Puzzle image not found.");
        return;
      }

      // Navigate to puzzle screen in the profilestack
      router.push({
        pathname: "/(protected)/(tabs)/(profilestack)/puzzle",
        params: {
          imageUri: puzzleData.photoURL,
          difficulty: getDifficultyText(puzzleData.difficulty),
          locationName: puzzleData.name,
          latitude: puzzleData.geoLocation.latitude.toString(),
          longitude: puzzleData.geoLocation.longitude.toString(),
          isFromMyPuzzles: "true"
        }
      });
    } catch (error) {
      console.error("Error loading puzzle:", error);
      Alert.alert("Error", "Failed to load puzzle. Please try again.");
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={[GeneralStyle.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00A9E0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[GeneralStyle.container, { flex: 1 }]}>
      <Stack.Screen 
        options={{ 
          title: "Puzzles",
          headerRight: () => (
            <TouchableOpacity onPress={fetchUserPuzzles}>
              <Text style={styles.refreshButton}>Refresh</Text>
            </TouchableOpacity>
          )
        }} 
      />
      <FlatList
        style={styles.list}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 100
        }}
        data={puzzles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.puzzleItem}
            onPress={() => handlePuzzlePress(item)}
          >
            <Text style={styles.puzzleName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.difficulty}>{getDifficultyText(item.difficulty)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No puzzles created yet</Text>
            <Text style={styles.emptySubText}>Wait for your friend to create a new puzzle to see it here!</Text>
          </View>
        )}
        onRefresh={fetchUserPuzzles}
        refreshing={isLoading}
        showsVerticalScrollIndicator={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
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
    flex: 1,
    marginRight: 10,
  },
  difficulty: {
    fontSize: 16,
    color: '#666',
    minWidth: 80,
    textAlign: 'right',
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
  },
  refreshButton: {
    color: '#00A9E0',
    fontSize: 16,
    padding: 10,
  }
});