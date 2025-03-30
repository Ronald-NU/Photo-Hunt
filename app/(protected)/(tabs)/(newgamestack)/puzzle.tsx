import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { PicturePuzzle } from 'react-native-picture-puzzle';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { useUser } from "@/components/UserContext";
import { PuzzleMiniData, PuzzleData } from "@/Firebase/DataStructures";
import { createPuzzleDocument } from "@/Firebase/firebaseHelperPuzzles";
import { updateUserDocument, getUserData } from "@/Firebase/firebaseHelperUsers";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

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

  const { imageUri, difficulty, locationName, latitude, longitude, isFromMyPuzzles } = params;
  const isViewMode = isFromMyPuzzles === "true";
  const gridSize = PUZZLE_SIZE[difficulty as keyof typeof PUZZLE_SIZE];
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    // Initialize puzzle pieces
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    // Only shuffle pieces if not in view mode
    if (!isViewMode) {
      for (let i = initialPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialPieces[i], initialPieces[j]] = [initialPieces[j], initialPieces[i]];
      }
      setHidden(totalPieces - 1);
    } else {
      setHidden(null);
    }
    setPieces(initialPieces);
  }, [isViewMode, totalPieces]);

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
    if (!isViewMode) {
      fetchDocId();
    }
  }, [user, isViewMode]);

  const handleChange = (nextPieces: readonly number[], nextHidden: number | null) => {
    if (isViewMode) return; // Disable puzzle interaction in view mode
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

  const handleBack = () => {
    if (isViewMode) {
      // If viewing from MyPuzzles, go back directly
      router.back();
    } else if (!isSaved) {
      // If creating new puzzle and not saved, show confirmation
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
            onPress: () => router.replace("/(protected)/(tabs)/(mapstack)")
          }
        ]
      );
    } else {
      router.replace("/(protected)/(tabs)/(mapstack)")
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "Please log in to save puzzles.");
      return;
    }

    try {
      // Generate a unique ID using timestamp and random string
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const puzzleData: PuzzleData = {
        id: uniqueId,
        creatorID: user.uid,
        name: locationName as string,
        photoURL: imageUri as string,
        difficulty: Number(gridSize),
        geoLocation: {
          latitude: Number(latitude),
          longitude: Number(longitude)
        }
      };

      // Create puzzle in Firebase Puzzles collection
      const puzzleDocId = await createPuzzleDocument(user.uid, puzzleData);
      
      if (!puzzleDocId) {
        throw new Error("Failed to create puzzle document");
      }

      // Get fresh user data to ensure we have the latest mypuzzles array
      const currentUserData = await getUserData(user.uid);
      if (!currentUserData) {
        throw new Error("Failed to get user data");
      }

      // Add to user's mypuzzles array
      const newPuzzle: PuzzleMiniData = {
        id: puzzleData.id,
        name: puzzleData.name,
        difficulty: puzzleData.difficulty
      };

      const updatedMypuzzles = currentUserData.mypuzzles ? [...currentUserData.mypuzzles, newPuzzle] : [newPuzzle];

      // Update user document with new puzzle
      await updateUserDocument(currentUserData.id, {
        mypuzzles: updatedMypuzzles
      });

      setIsSaved(true);

      // Show success message with options
      Alert.alert(
        "Puzzle Saved",
        "Your puzzle has been saved successfully!",
        [
          {
            text: "View My Puzzles",
            onPress: () => {
              router.replace({
                pathname: "/(protected)/(tabs)/(profilestack)/myPuzzles",
                params: { refresh: "true" }
              });
            }
          },
          {
            text: "Continue Playing",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error('Error saving puzzle:', error);
      Alert.alert(
        "Error",
        "Failed to save puzzle. Please try again.",
        [
          {
            text: "Retry",
            onPress: handleSave
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
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
            !isViewMode ? (
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.headerButton}>Save</Text>
              </TouchableOpacity>
            ) : null
          ),
          title: locationName as string,
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Text style={styles.title}>{locationName as string}</Text>
              <Text style={styles.moves}>
                {isViewMode ? `Difficulty: ${difficulty}` : `Moves: ${moves}`}
              </Text>
            </View>
          )
        }}
      />

      <View style={styles.puzzleContainer}>
        {pieces.length > 0 ? (
          isViewMode ? (
            <Image
              style={{
                width: Dimensions.get('window').width - 40,
                height: Dimensions.get('window').width - 40,
                resizeMode: 'contain'
              }}
              source={{ uri: imageUri as string }}
            />
          ) : (
            <PicturePuzzle
              size={Dimensions.get('window').width - 40}
              pieces={pieces}
              hidden={hidden}
              onChange={handleChange}
              source={{ uri: imageUri as string }}
            />
          )
        ) : (
          <View style={styles.loadingContainer}>
            <Text>Loading puzzle...</Text>
          </View>
        )}
      </View>

      {isComplete && !isViewMode && (
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 