import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { getPuzzleLeaderBoard } from '@/Firebase/firebaseHelperPlayData';
import { getUserData } from '@/Firebase/firebaseHelperUsers';
import { PlayData } from '@/Firebase/DataStructures';
import NotificationManager from '@/components/NotificationManager';
import { GeneralStyle, TextStyles } from '@/constants/Styles';
import { LeaderboardItem } from '@/components/LeaderboardItem';

const STAR_COLORS = {
  filled: colors.Gold, // Gold color for filled stars
  empty: '#D3D3D3', // Light gray for empty stars
};

export default function MarkerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { puzzleId, puzzleName, creatorId, difficulty, imageUri, verified } = params;
  const [creatorName, setCreatorName] = useState('');
  const [topScores, setTopScores] = useState<PlayData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (verified === 'true') {
      Alert.alert("Verified", "Puzzle verified successfully! 🎉");
    }
  }, [verified]);

  const fetchPlayData = useCallback(async () => {
    setIsLoading(true);
    const leaderboardScores = await getPuzzleLeaderBoard(puzzleId as string);
    if (leaderboardScores && Array.isArray(leaderboardScores)) {
      // Sort by score (lower is better)
      const completedGames = leaderboardScores.filter((score: PlayData) => score.isCompleted === true && score.isPhotoVerified === true);
      const sortedScores = completedGames
        .sort((a: PlayData, b: PlayData) => b.score - a.score)
        .slice(0, 10); // Get top 10 scores
      setTopScores(sortedScores);
    }
    setIsLoading(false);
  }, [puzzleId]);

  useFocusEffect(
    useCallback(() => {
      fetchPlayData();
    }, [fetchPlayData])
  );

  useEffect(() => {
    setIsLoading(true);
    const loadCreatorName = async () => {
      const creator = await getUserData(creatorId as string);
      if (creator) {
        setCreatorName(creator.name);
      }
    };
    loadCreatorName();
    fetchPlayData();
  }, [creatorId, puzzleId, fetchPlayData]);

  const handlePlay = () => {
    router.push({
      pathname: "/(protected)/(tabs)/(mapstack)/puzzle",
      params: {
        imageUri: imageUri,
        difficulty: getDifficultyText(parseInt(difficulty as string)),
        locationName: puzzleName,
        puzzleId,
        creatorId
      }
    });
  };

  const getDifficultyText = (difficulty: number) => {
    switch(difficulty) {
      case 3: return "Easy";
      case 4: return "Medium";
      case 5: return "Hard";
      default: return "Unknown";
    }
  };

  const renderDifficultyStars = () => {
    const difficultyNum = parseInt(difficulty as string);
    const totalStars = 3;
    return (
      <View style={styles.starsContainer}>
        {[...Array(totalStars)].map((_, index) => (
          <Ionicons
            key={index}
            name="star"
            size={30}
            color={index < difficultyNum - 2 ? STAR_COLORS.filled : STAR_COLORS.empty}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} onPressIn={() => router.back()}>
              <Text style={styles.headerButton}>Back</Text>
            </TouchableOpacity>
          ),
          title: puzzleName as string,
          headerRight: () => (
            <NotificationManager title={puzzleName as string} />
          ),
        }}
      />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{puzzleName}</Text>
        </View>

        <Text style={styles.creatorText}>created by</Text>
        <Text style={styles.creatorName}>{creatorName}</Text>

        <View style={styles.difficultyContainer}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          {renderDifficultyStars()}
        </View>

        <View style={styles.scoresContainer}>
          <Text style={styles.sectionTitle}>Top Scores</Text>
          <FlatList
            style={GeneralStyle.list}
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingBottom: 100
            }}
            data={topScores}
            keyExtractor={(item) => item.id || `${item.playerID}-${item.puzzleID}-${item.name}-${item.score}`}
            renderItem={({ item, index }) => (
              <LeaderboardItem item={item} index={index} />
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

        {verified !== 'true' && (
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Text style={styles.playButtonText}>Play/Resume</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.White,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  headerButton: {
    color: colors.Primary,
    fontSize: 17,
    padding: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.Black,
  },
  creatorText: {
    fontSize: 14,
    color: colors.Grey,
    marginTop: 5,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.Black,
    marginBottom: 20,
  },
  difficultyContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.Black,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  scoresContainer: {
    width: '100%',
    flex: 0.8,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rankText: {
    width: 40,
    fontSize: 14,
    color: colors.Grey,
  },
  scoreBar: {
    flex: 1,
    height: 10,
    backgroundColor: colors.LightGrey,
    borderRadius: 5,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.Primary,
    borderRadius: 5,
  },
  playButton: {
    backgroundColor: colors.Primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  playButtonText: {
    color: colors.White,
    fontSize: 18,
    fontWeight: '600',
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