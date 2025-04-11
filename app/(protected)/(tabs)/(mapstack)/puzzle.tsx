import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Vibration } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { colors } from '@/constants/Colors';
import NotificationManager from '@/components/NotificationManager';
import PuzzleSection from '@/components/PuzzleSection';
import { PicturePuzzle } from 'react-native-picture-puzzle';
import { Ionicons } from '@expo/vector-icons';


const PUZZLE_SIZE = {
  'Easy': 3, // 3x3 grid
  'Medium': 4, // 4x4 grid
  'Hard': 5, // 5x5 grid
};

const getBestHintMove = (current: number[], hidden: number, gridSize: number): number[] | null => {
  const getManhattanDistance = (a: number[], b: number[]) =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

  const indexToCoord = (index: number) => [Math.floor(index / gridSize), index % gridSize];
  const coordToIndex = (row: number, col: number) => row * gridSize + col;

  const hiddenCoord = indexToCoord(hidden);
  const directions = [
    [0, 1],  // right
    [1, 0],  // down
    [0, -1], // left
    [-1, 0], // up
  ];

  let bestMove = null;
  let bestScore = Infinity;

  // Calculate current total distance
  const getTotalDistance = (pieces: number[]) => {
    let total = 0;
    for (let i = 0; i < pieces.length; i++) {
      if (i === hidden) continue;
      const currentCoord = indexToCoord(i);
      const correctCoord = indexToCoord(pieces[i]);
      total += getManhattanDistance(currentCoord, correctCoord);
    }
    return total;
  };

  const currentTotalDistance = getTotalDistance(current);

  // Check each piece adjacent to the empty space
  for (const [dr, dc] of directions) {
    const nr = hiddenCoord[0] + dr;
    const nc = hiddenCoord[1] + dc;

    if (nr < 0 || nc < 0 || nr >= gridSize || nc >= gridSize) continue;

    const swapIndex = coordToIndex(nr, nc);
    const pieceToMove = current[swapIndex];
    
    // Skip if this piece is already in the correct position
    const currentCoord = indexToCoord(swapIndex);
    const correctCoord = indexToCoord(pieceToMove);
    if (currentCoord[0] === correctCoord[0] && currentCoord[1] === correctCoord[1]) continue;

    // Try the move
    const swapped = [...current];
    [swapped[hidden], swapped[swapIndex]] = [swapped[swapIndex], swapped[hidden]];
    
    // Calculate new total distance
    const newTotalDistance = getTotalDistance(swapped);
    
    // Calculate individual piece improvements
    const movedPieceNewCoord = indexToCoord(hidden);
    const movedPieceNewDistance = getManhattanDistance(movedPieceNewCoord, correctCoord);
    const movedPieceOldDistance = getManhattanDistance(currentCoord, correctCoord);
    const pieceImprovement = movedPieceOldDistance - movedPieceNewDistance;

    // Score the move based on multiple factors
    const score = (
      newTotalDistance * 0.7 + // Overall state improvement (70% weight)
      (currentTotalDistance - newTotalDistance) * 0.3 + // Total improvement (30% weight)
      (pieceImprovement > 0 ? -10 : 10) // Bonus for improving the moved piece
    );

    if (score < bestScore) {
      bestScore = score;
      bestMove = swapped;
    }
  }

  return bestMove;
};

export default function MapPuzzleScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const { imageUri, difficulty, locationName } = params;
  const [moves, setMoves] = useState(0);
  const [pieces, setPieces] = useState<number[]>([]);
  const [hidden, setHidden] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  const handleBack = () => {
    router.canGoBack() ? router.back() : router.push('/(protected)/(tabs)/(mapstack)/map');
  };

  const objectPath = encodeURIComponent((imageUri as string).split('/o/')[1].split('?')[0]);
  const imageURI = (imageUri as string).split('/o/')[0] + '/o/' + objectPath + '?alt=media&token=' + (imageUri as string).split('token=')[1];
  const source = React.useMemo(() => ({ uri: imageURI }), [imageURI]);
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
    const hiddenIndex = totalPieces - 1;
    setHidden(hiddenIndex);
    setPieces(initialPieces);
    console.log('Initialized puzzle with hidden index:', hiddenIndex);
  }, [totalPieces]);

  const handleChange = (nextPieces: readonly number[], nextHidden: number | null) => {
    // Check if pieces actually changed
    const piecesChanged = nextPieces.some((piece, index) => piece !== pieces[index]);
    if (piecesChanged) {
      Vibration.vibrate(50); // Only vibrate if pieces moved
    }

    setPieces([...nextPieces]);
    setHidden(nextHidden);
    setMoves(prev => prev + 1);

    // Check if puzzle is complete
    const isCorrect = nextPieces.every((piece, index) => piece === index);
    if (isCorrect) {
      setIsComplete(true);
    }
  };

  const solvePuzzle = () => {
    if (isSolving || isComplete) return;
    setIsSolving(true);

    const targetPieces = Array.from({ length: totalPieces }, (_, i) => i);
    const currentPieces = [...pieces];
    const moves: number[][] = [];

    // Find the correct position for each piece
    for (let i = 0; i < totalPieces; i++) {
      if (currentPieces[i] !== i) {
        // Find where the correct piece is
        const correctPieceIndex = currentPieces.indexOf(i);
        // Find where the empty space is
        const emptyIndex = currentPieces.indexOf(totalPieces - 1);
        
        // Move the correct piece to its position
        if (correctPieceIndex !== emptyIndex) {
          [currentPieces[correctPieceIndex], currentPieces[emptyIndex]] = 
          [currentPieces[emptyIndex], currentPieces[correctPieceIndex]];
          moves.push([...currentPieces]);
        }
      }
    }

    // Animate the moves
    let moveIndex = 0;
    const animateMove = () => {
      if (moveIndex < moves.length) {
        setPieces(moves[moveIndex]);
        setHidden(totalPieces - 1);
        moveIndex++;
        setTimeout(animateMove, 300); // 300ms delay between moves
      } else {
        setIsSolving(false);
        setIsComplete(true);
      }
    };

    animateMove();
  };

  const giveHint = () => {
    console.log('Give hint called with:', { hidden, isComplete, isSolving });
    if (isComplete || isSolving) return;
    if (hidden === null) {
      console.log('No hidden piece found, setting to last piece');
      setHidden(totalPieces - 1);
      return;
    }
    const hint = getBestHintMove(pieces, hidden, gridSize);
    if (hint) {
      setPieces(hint);
      setHidden(hint.indexOf(totalPieces - 1));
      setMoves(prev => prev + 1);
      // Add vibration feedback for hint
      Vibration.vibrate(50);
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
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={giveHint} 
                disabled={isSolving || isComplete}
                style={[styles.hintButton, (isSolving || isComplete) && styles.hintButtonDisabled]}
              >
                <Ionicons name="bulb-outline" size={24} color="gold" />
              </TouchableOpacity>
              <NotificationManager title={(params.locationName as string)}/>
            </View>
          ),
        }}
      />

      <View style={styles.puzzleContainer}>
        <View style={styles.puzzleWrapper}>
          <Text style={styles.movesText}>Moves: {moves}</Text>
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
  movesText: {
    color: colors.Grey,
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
  },
  puzzleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: -180,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintButton: {
    padding: 8,
    marginRight: 10,
  },
  hintButtonDisabled: {
    opacity: 0.5,
  },
}); 