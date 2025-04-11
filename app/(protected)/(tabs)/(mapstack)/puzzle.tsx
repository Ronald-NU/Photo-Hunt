import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { colors } from '@/constants/Colors';
import NotificationManager from '@/components/NotificationManager';
import PuzzleSection from '@/components/PuzzleSection';
import { PicturePuzzle } from 'react-native-picture-puzzle';


const PUZZLE_SIZE = {
  'Easy': 3, // 3x3 grid
  'Medium': 4, // 4x4 grid
  'Hard': 5, // 5x5 grid
};

export default function MapPuzzleScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const { imageUri, difficulty, locationName } = params;
  const [moves, setMoves] = useState(0);
  const [pieces, setPieces] = useState<number[]>([]);
  const [hidden, setHidden] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const handleBack = () => {
    router.canGoBack() ? router.back() : router.push('/(protected)/(tabs)/(mapstack)/map');
  };

  const objectPath = encodeURIComponent((imageUri as string).split('/o/')[1].split('?')[0]);
  const imageURI = (imageUri as string).split('/o/')[0] + '/o/' + objectPath + '?alt=media&token=' + (imageUri as string).split('token=')[1];
  const source = React.useMemo(() => ({
    uri: imageURI,
  }), []);
  const gridSize = PUZZLE_SIZE[difficulty as keyof typeof PUZZLE_SIZE];
  const totalPieces = gridSize * gridSize;
  useEffect(() => {
    // Initialize puzzle pieces
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    // Only shuffle pieces if not in view mode
      for (let i = initialPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialPieces[i], initialPieces[j]] = [initialPieces[j], initialPieces[i]];
      }
      setHidden(totalPieces - 1);
    setPieces(initialPieces);
  }, [totalPieces]);

  const handleChange = (nextPieces: readonly number[], nextHidden: number | null) => {
    setPieces([...nextPieces]);
    setHidden(nextHidden);
    setMoves(prev => prev + 1);

    // Check if puzzle is complete
    const isCorrect = nextPieces.every((piece, index) => piece === index);
    if (isCorrect) {
      setIsComplete(true);
    }
  };

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={()=>handleBack()} onPressIn={()=>handleBack()}>
              <Text style={styles.headerButton}>Back</Text>
            </TouchableOpacity>
          ),
          title: locationName as string,
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Text style={styles.title}>{locationName as string}</Text>
              <Text style={styles.difficulty}>Difficulty: {difficulty}</Text>
            </View>
          ),
          headerRight: () => (
            <NotificationManager title={(params.locationName as string)}/>
          ),
        }}
      />

      <View style={styles.puzzleContainer}>
      {pieces.length > 0?
      <PicturePuzzle
              size={Dimensions.get('window').width - 40}
              pieces={pieces}
              hidden={hidden}
              onChange={handleChange}
              source={source}
            />
        :null}
      </View>
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
  difficulty: {
    fontSize: 14,
    color: colors.Grey,
  },
  puzzleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }
}); 