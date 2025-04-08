// app/(protected)/(tabs)/leaderboard.tsx
import { useFocusEffect, useRouter } from "expo-router";

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { GeneralStyle, TextStyles } from "@/constants/Styles";
import { colors } from "@/constants/Colors";
import PuzzleSection from "@/components/PuzzleSection";
import { useCallback, useState } from "react";
import { PlayData } from "@/Firebase/DataStructures";
import { getLocalLeaderBoard } from "@/Firebase/firebaseHelperUsers";

export default function LeaderboardScreen() {
  const router = useRouter();
  const [playData, setPlayData] = useState<PlayData[]>([]);
  const [isLoading, setIsLoading] = useState(false);


    const fetchPlayData = useCallback(async () => {
      setIsLoading(true);
      try {
        // Get fresh user data from the database
        const TopOneHunderedData = await getLocalLeaderBoard() as PlayData[];
        console.log(TopOneHunderedData);
        if (TopOneHunderedData) {
          setPlayData(TopOneHunderedData);
        } else {
          setPlayData([]);
        }
      } catch (error) {
        console.error("Error fetching user puzzles:", error);
        Alert.alert("Error", "Failed to load leaderboard. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    useFocusEffect(
      useCallback(() => {
        fetchPlayData();
      }, [fetchPlayData])
    );

  return (
<SafeAreaView style={styles.container}>
      <View style={styles.content}>
      <FlatList
        style={GeneralStyle.list}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 100
        }}
        data={playData}
        keyExtractor={(item) => item.playerID+item.puzzleID}
        renderItem={({ item }) => (
        <View></View>
          //  <PuzzleSection onPress={(()=>{})} item={item} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Leaderboard Couldn't Load</Text>
            <Text style={styles.emptySubText}>Refresh the Leaderboard!</Text>
          </View>
        )}
        onRefresh={fetchPlayData}
        refreshing={isLoading}
        showsVerticalScrollIndicator={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
      </View>
</SafeAreaView>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.White,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
});