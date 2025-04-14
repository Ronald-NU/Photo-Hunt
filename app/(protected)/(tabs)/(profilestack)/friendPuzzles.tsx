import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { PuzzleData, PuzzleMiniData, UserData } from '@/Firebase/DataStructures';
import { getPuzzleData } from '@/Firebase/firebaseHelperPuzzles';
import { getFriend } from '@/Firebase/firebaseHelperUsers';
import { colors } from '@/constants/Colors';
import PuzzleSection from '@/components/PuzzleSection';

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
      // leads to GamePuzzle
      const pathname = "/(protected)/(tabs)/(mapstack)/puzzle";
      // Navigate to puzzle screen in the profilestack
      console.log("puzzleData", puzzleData);
      router.push({
        pathname: pathname,
        params: {
          imageUri: puzzleData.photoURL,
          difficulty: getDifficultyText(puzzleData.difficulty),
          locationName: puzzleData.name,
          latitude: puzzleData.geoLocation.latitude.toString(),
          longitude: puzzleData.geoLocation.longitude.toString(),
          puzzleId: puzzleData.id,
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
    <SafeAreaView style={[GeneralStyle.container, { flex: 1}]}>
      <Stack.Screen 
        options={{ 
          title: `${params.name}'s Puzzles`,
          headerRight: () => (
            <TouchableOpacity onPress={fetchUserPuzzles}>
              <Text style={styles.refreshButton}>Refresh</Text>
            </TouchableOpacity>
          )
        }} 
      />
      <FlatList
        style={GeneralStyle.list}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 100
        }}
        data={puzzles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PuzzleSection onPress={handlePuzzlePress} item={item} />
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
    color: colors.Grey,
    textAlign: 'center',
  },
  refreshButton: {
    color: '#00A9E0',
    fontSize: 16,
    padding: 10,
  }
});