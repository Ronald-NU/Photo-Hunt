import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { PicturePuzzle } from 'react-native-picture-puzzle';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { useUser } from "@/components/UserContext";
import { PuzzleMiniData, PuzzleData } from "@/Firebase/DataStructures";
import { createPuzzleDocument } from "@/Firebase/firebaseHelperPuzzles";
import { updateUserDocument, getUserData } from "@/Firebase/firebaseHelperUsers";

const PUZZLE_SIZE = {
  Easy: 3, // 3x3 grid
  Medium: 4, // 4x4 grid
  Hard: 5, // 5x5 grid
};

export default function PuzzleScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [moves, setMoves] = useState(0);
  const [pieces, setPieces] = useState<number[]>([]);
  const [hidden, setHidden] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Get user document ID when component mounts
    const fetchDocId = async () => {
      if (user) {
        const userDoc = await getUserData(user.uid);
        if (userDoc) {
          setDocId(userDoc.id);
        }
      }
    };
    fetchDocId();
  }, [user]);

  const { imageUri, difficulty, locationName, latitude, longitude } = params;
  const gridSize = PUZZLE_SIZE[difficulty as keyof typeof PUZZLE_SIZE];
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    // Initialize puzzle pieces
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    // Shuffle pieces
    for (let i = initialPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialPieces[i], initialPieces[j]] = [initialPieces[j], initialPieces[i]];
    }
    setPieces(initialPieces);
    setHidden(totalPieces - 1);
  }, []);

  const handleChange = (nextPieces: readonly number[], nextHidden: number | null) => {
    setPieces([...nextPieces]);
    setHidden(nextHidden);
    setMoves(prev => prev + 1);

    // Check if puzzle is complete
    const isCorrect = nextPieces.every((piece, index) => piece === index);
    if (isCorrect) {
      setIsComplete(true);
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!user || !docId) return;

    const puzzleData: PuzzleData = {
      id: Date.now().toString(),
      creatorID: user.uid,
      name: locationName as string,
      photoURL: imageUri as string,
      difficulty: Number(gridSize),
      geoLocation: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      }
    };

    try {
      // Create puzzle in Firebase Puzzles collection
      const puzzleDocId = await createPuzzleDocument(user.uid, puzzleData);
      if (puzzleDocId) {
        // Add to user's mypuzzles array
        const newPuzzle: PuzzleMiniData = {
          id: puzzleData.id,
          name: puzzleData.name,
          difficulty: puzzleData.difficulty
        };

        const updatedMypuzzles = user.mypuzzles ? [...user.mypuzzles, newPuzzle] : [newPuzzle];

        // Update user document with new puzzle
        await updateUserDocument(docId, {
          mypuzzles: updatedMypuzzles
        });
        setIsSaved(true);
        Alert.alert(
          "Puzzle Saved",
          "Your puzzle has been saved successfully! You can view it in Profile > My Puzzles.",
          [
            {
              text: "View My Puzzles",
              onPress: () => router.push("/(protected)/(tabs)/(profilestack)/myPuzzles")
            },
            {
              text: "Continue Playing",
              style: "cancel"
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving puzzle:', error);
      Alert.alert("Error", "Failed to save puzzle. Please try again.");
    }
  };

  const handleBack = () => {
    if (!isSaved) {
      Alert.alert(
        "Leave without saving?",
        "Your puzzle hasn't been saved yet. Are you sure you want to leave?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Leave",
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.headerButton}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.headerButton}>Save</Text>
            </TouchableOpacity>
          ),
          title: locationName as string,
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Text style={styles.title}>{locationName as string}</Text>
              <Text style={styles.moves}>Moves: {moves}</Text>
            </View>
          )
        }}
      />

      <View style={styles.puzzleContainer}>
        {pieces.length > 0 && (
          <PicturePuzzle
            size={Dimensions.get('window').width - 40}
            pieces={pieces}
            hidden={hidden}
            onChange={handleChange}
            source={{ uri: imageUri as string }}
          />
        )}
      </View>

      {isComplete && (
        <View style={styles.completeContainer}>
          <Text style={styles.completeText}>Puzzle Complete!</Text>
          <Text style={styles.completeSubText}>Total Moves: {moves}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push("/(protected)/(tabs)/(profilestack)/myPuzzles")}
          >
            <Text style={styles.buttonText}>View My Puzzles</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    color: '#007AFF',
    fontSize: 17,
    padding: 10,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  moves: {
    fontSize: 14,
    color: '#666',
  },
  puzzleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  completeSubText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 