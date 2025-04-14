import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Vibration, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { colors } from '@/constants/Colors';
import NotificationManager from '@/components/NotificationManager';
import PuzzleSection from '@/components/PuzzleSection';
import { PicturePuzzle } from 'react-native-picture-puzzle';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/Firebase/firebaseSetup';
import { getPuzzleLeaderBoard, createPlayDocument, updatePlayDataDocument } from '@/Firebase/firebaseHelperPlayData';
import { PlayData, PuzzleData } from '@/Firebase/DataStructures';
import { useUser } from '@/components/UserContext';


const PUZZLE_SIZE = {
  'Easy': 3, // 3x3 grid
  'Medium': 4, // 4x4 grid
  'Hard': 5, // 5x5 grid
};

// Node class for A* search
class Node {
  state: number[];
  parent: Node | null;
  g: number;  // cost from start
  h: number;  // heuristic (estimated cost to goal)
  f: number;  // total cost (g + h)
  hiddenIndex: number;
  move: number | null; // The piece that was moved to reach this state

  constructor(state: number[], parent: Node | null, g: number, hiddenIndex: number, gridSize: number, move: number | null = null) {
    this.state = state;
    this.parent = parent;
    this.g = g;
    this.hiddenIndex = hiddenIndex;
    this.move = move;
    this.h = this.calculateHeuristic(gridSize);
    this.f = this.g + this.h;
  }

  calculateHeuristic(gridSize: number): number {
    let h = 0;
    let linearConflicts = 0;

    // Calculate Manhattan distance and linear conflicts
    for (let i = 0; i < this.state.length; i++) {
      const value = this.state[i];
      if (value === this.state.length - 1) continue; // Skip the empty tile (labeled as last index)

      const currentRow = Math.floor(i / gridSize);
      const currentCol = i % gridSize;
      const targetRow = Math.floor(value / gridSize);
      const targetCol = value % gridSize;

      // Manhattan distance
      h += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);

      // Check for linear conflicts in row
      if (currentRow === targetRow) {
        for (let j = i + 1; j < (currentRow + 1) * gridSize; j++) {
          const otherValue = this.state[j];
          if (otherValue === this.state.length - 1) continue;
          const otherTargetRow = Math.floor(otherValue / gridSize);
          if (otherTargetRow === currentRow && 
              ((value > otherValue && i < j) || (value < otherValue && i > j))) {
            linearConflicts += 2;
          }
        }
      }

      // Check for linear conflicts in column
      if (currentCol === targetCol) {
        for (let j = i + gridSize; j < this.state.length; j += gridSize) {
          const otherValue = this.state[j];
          if (otherValue === this.state.length - 1) continue;
          const otherTargetCol = otherValue % gridSize;
          if (otherTargetCol === currentCol &&
              ((value > otherValue && i < j) || (value < otherValue && i > j))) {
            linearConflicts += 2;
          }
        }
      }
    }

    return h + linearConflicts;
  }

  getNextStates(gridSize: number): Node[] {
    const nextStates: Node[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // up, down, left, right
    const currentRow = Math.floor(this.hiddenIndex / gridSize);
    const currentCol = this.hiddenIndex % gridSize;

    for (const [dr, dc] of directions) {
      const newRow = currentRow + dr;
      const newCol = currentCol + dc;
      
      if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
        const newHiddenIndex = newRow * gridSize + newCol;
        const newState = [...this.state];
        const movedPiece = newState[newHiddenIndex];
        [newState[this.hiddenIndex], newState[newHiddenIndex]] = [newState[newHiddenIndex], newState[this.hiddenIndex]];
        nextStates.push(new Node(newState, this, this.g + 1, newHiddenIndex, gridSize, movedPiece));
      }
    }
    return nextStates;
  }

  isGoal(): boolean {
    // For a sliding puzzle, the goal state is when all pieces except the empty tile are in order
    // The empty tile is the piece with value equal to totalPieces - 1
    for (let i = 0; i < this.state.length; i++) {
      const value = this.state[i];
      // Skip the empty tile
      if (value === this.state.length - 1) continue;
      // Check if the piece is in its correct position
      if (value !== i) return false;
    }
    return true;
  }

  // For equality comparisons in the closed set
  getStateString(): string {
    return this.state.join(',');
  }
}

// A* search implementation
const aStarSearch = (initial: number[], hiddenIndex: number, gridSize: number, maxNodes: number = 10000): Node[] | null => {
  const startNode = new Node(initial, null, 0, hiddenIndex, gridSize);
  
  // Use a priority queue for the open set (nodes to be evaluated)
  const openSet: Node[] = [startNode];
  
  // Use a Map for the closed set (already evaluated nodes)
  const closedSet = new Map<string, number>();
  
  let nodesEvaluated = 0;
  
  while (openSet.length > 0 && nodesEvaluated < maxNodes) {
    nodesEvaluated++;
    
    // Sort by f value and get the node with the lowest f
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    // Check if we've reached the goal
    if (current.isGoal()) {
      // Reconstruct path
      const path: Node[] = [];
      let node: Node | null = current;
      while (node !== null) {
        path.unshift(node);
        node = node.parent;
      }
      return path;
    }
    
    // Add to closed set
    closedSet.set(current.getStateString(), current.f);
    
    // Get next possible states
    const nextStates = current.getNextStates(gridSize);
    
    for (const nextNode of nextStates) {
      const nextStateString = nextNode.getStateString();
      
      // Skip if we've already evaluated this state with a better score
      if (closedSet.has(nextStateString) && closedSet.get(nextStateString)! <= nextNode.f) {
        continue;
      }
      
      // Check if state is already in open set
      const existingIndex = openSet.findIndex(node => node.getStateString() === nextStateString);
      
      if (existingIndex === -1) {
        // State not in open set, add it
        openSet.push(nextNode);
      } else if (nextNode.f < openSet[existingIndex].f) {
        // If this path to the state is better, update it
        openSet[existingIndex] = nextNode;
      }
    }
  }
  
  console.log(`A* search terminated after evaluating ${nodesEvaluated} nodes without finding solution`);
  return null; // No solution found within node limit
};

// Function to get a hint move
const getBestHintMove = (current: number[], hidden: number, gridSize: number): number[] | null => {
  // Try a full A* search with a limit to prevent too much computation
  const path = aStarSearch(current, hidden, gridSize, 1000);
  
  if (path && path.length > 1) {
    // Return the next state from the optimal path
    return path[1].state;
  }
  
  // Fallback to a simpler heuristic if A* is too expensive
  const startNode = new Node(current, null, 0, hidden, gridSize);
  const nextStates = startNode.getNextStates(gridSize);
  
  if (nextStates.length === 0) return null;
  
  // Find the move that most improves the heuristic score
  nextStates.sort((a, b) => a.h - b.h);
  return nextStates[0].state;
};

// Add solvability check function
const isSolvable = (tiles: number[], gridSize: number): boolean => {
  const inversions = tiles.reduce((inv, val, i) => {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] !== tiles.length - 1 && tiles[j] !== tiles.length - 1 && tiles[i] > tiles[j]) {
        inv++;
      }
    }
    return inv;
  }, 0);

  const blankRowFromBottom = gridSize - Math.floor(tiles.indexOf(tiles.length - 1) / gridSize);

  if (gridSize % 2 === 1) {
    return inversions % 2 === 0;
  } else {
    return (inversions + blankRowFromBottom) % 2 === 0;
  }
};

export default function MapPuzzleScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { user, id } = useUser();
  
  const { imageUri, difficulty, locationName, puzzleId, creatorId } = params;
  console.log('Received params:', { puzzleId, imageUri, difficulty, locationName });
  
  const gridSize = PUZZLE_SIZE[difficulty as keyof typeof PUZZLE_SIZE];
  const totalPieces = gridSize * gridSize;
  
  const [moves, setMoves] = useState<number | null>(null);
  const [pieces, setPieces] = useState<number[]>([]);
  const [hidden, setHidden] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [playId, setPlayId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastHint, setLastHint] = useState<string | null>(null);
  const [hintPiece, setHintPiece] = useState<number | null>(null);

  // Load saved moves from Firebase
  useEffect(() => {
    const loadSavedMoves = async () => {
      console.log('Loading saved moves with:', { puzzleId, hasUser: !!auth.currentUser });
      if (!auth.currentUser || !puzzleId) {
        console.log('Cannot load saved moves:', { hasUser: !!auth.currentUser, hasPuzzleId: !!puzzleId });
        return;
      }
      
      try {
        const leaderboard = await getPuzzleLeaderBoard(puzzleId as string);
        console.log('Got leaderboard:', leaderboard);
        if (Array.isArray(leaderboard)) {
          const userPlay = leaderboard.find(play => play.playerID === auth.currentUser?.uid);
          console.log('Found user play:', userPlay);
          if (userPlay) {
            setMoves(userPlay.moves);
            setPlayId(userPlay.id);
            // 如果拼图已经完成，立即设置完成状态
            if (userPlay.isCompleted) {
              setIsComplete(true);
              // 设置正确的拼图状态
              const correctPieces = Array.from({ length: totalPieces }, (_, i) => i);
              setPieces(correctPieces);
              setHidden(totalPieces - 1);
            }
          } else {
            // Create new play record if none exists
            const playData: PlayData = {
              puzzleID: puzzleId as string,
              playerID: auth.currentUser.uid,
              name: auth.currentUser.displayName || 'Anonymous',
              moves: 0,
              score: 0
            };
            console.log('Creating new play record with:', playData);
            const newPlayId = await createPlayDocument(playData);
            console.log('Got new play ID:', newPlayId);
            if (newPlayId && typeof newPlayId === 'string') {
              setPlayId(newPlayId);
              setMoves(0);
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved moves:', error);
      }
    };

    loadSavedMoves();
  }, [auth.currentUser, puzzleId, totalPieces]);

  // Auto-save moves every 1.5 seconds when moves change
  useEffect(() => {
    if (moves !== null && moves > 0 && playId) {
      const debounce = setTimeout(async () => {
        if (!isSaving) {
          await saveMovesToFirebase();
        }
      }, 1500);
      return () => clearTimeout(debounce);
    }
  }, [moves, playId]);

  const saveMovesToFirebase = async () => {
    // 检查必需的数据
    if (!auth.currentUser || !puzzleId || !playId) {
      console.error('Cannot save: missing required data', {
        hasUser: !!auth.currentUser,
        hasPuzzleId: !!puzzleId,
        hasPlayId: !!playId
      });
      return false;
    }

    if (moves === null) {
      console.error('Cannot save: moves is null');
      return false;
    }

    // 如果已经在保存中，直接返回
    if (isSaving) {
      console.log('Already saving, skipping this save');
      return false;
    }

    try {
      setIsSaving(true);
      const playData: PlayData = {
        puzzleID: puzzleId as string,
        playerID: auth.currentUser.uid,
        name: user?.name || 'Anonymous',
        moves: moves,
        score: moves,
        isCompleted: isComplete
      };
      
      const result = await updatePlayDataDocument(playId, playData, id);
      if (result === true) {
        console.log('Successfully saved moves:', moves);
        return true;
      } else {
        console.error('Failed to save moves:', result);
        return false;
      }
    } catch (error) {
      console.error('Error saving moves:', error);
      return false;
    } finally {
      // 确保在 finally 中重置 isSaving 状态
      setIsSaving(false);
    }
  };

  const handleBack = async () => {
    if (moves !== null && moves > 0) {
      Alert.alert(
        "Save Progress?",
        "Do you want to save your progress before leaving?",
        [
          {
            text: "Save & Leave",
            onPress: async () => {
              const saved = await saveMovesToFirebase();
              if (saved) {
                router.canGoBack() ? router.back() : router.push('/(protected)/(tabs)/(mapstack)/map');
              } else {
                Alert.alert("Error", "Failed to save progress. Please try again.");
              }
            }
          },
          {
            text: "Leave Without Saving",
            onPress: () => {
              router.canGoBack() ? router.back() : router.push('/(protected)/(tabs)/(mapstack)/map');
            },
            style: "destructive"
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } else {
      router.canGoBack() ? router.back() : router.push('/(protected)/(tabs)/(mapstack)/map');
    }
  };

  const objectPath = encodeURIComponent((imageUri as string).split('/o/')[1].split('?')[0]);
  const imageURI = (imageUri as string).split('/o/')[0] + '/o/' + objectPath + '?alt=media&token=' + (imageUri as string).split('token=')[1];
  const source = React.useMemo(() => ({ uri: imageURI }), [imageURI]);
  useEffect(() => {
    // Initialize puzzle pieces
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
    let shuffledPieces: number[];
    
    // Keep shuffling until we get a solvable configuration
    do {
      shuffledPieces = [...initialPieces];
      for (let i = shuffledPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]];
      }
    } while (!isSolvable(shuffledPieces, gridSize));

    const hiddenIndex = totalPieces - 1;
    setHidden(hiddenIndex);
    setPieces(shuffledPieces);
    console.log('Initialized puzzle with hidden index:', hiddenIndex);
  }, [totalPieces]);

  const handleChange = (nextPieces: readonly number[], nextHidden: number | null) => {
    // Check if pieces actually changed
    const piecesChanged = nextPieces.some((piece, index) => piece !== pieces[index]);
    if (piecesChanged) {
      Vibration.vibrate(50); // Only vibrate if pieces moved
      setMoves(prev => (prev !== null ? prev + 1 : 1));
    }

    setPieces([...nextPieces]);
    setHidden(nextHidden);

    // Check if puzzle is complete (all pieces except the empty tile are in correct position)
    let isCorrect = true;
    for (let i = 0; i < nextPieces.length; i++) {
      const value = nextPieces[i];
      // Skip the empty tile
      if (value === totalPieces - 1) continue;
      // Check if the piece is in its correct position
      if (value !== i) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect && !isComplete) {
      setIsComplete(true);
      // Save final moves when puzzle is completed
      saveMovesToFirebase();
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

  // Add global effect to check completion status
  useEffect(() => {
    if (pieces.length === totalPieces) {
      const isCorrect = pieces.every((value, index) => 
        value === totalPieces - 1 ? true : value === index
      );
      if (isCorrect && !isComplete) {
        setIsComplete(true);
        // Save final moves when puzzle is completed
        saveMovesToFirebase()
      }
    }
    }, [pieces, totalPieces, isComplete, moves]);

  const giveHint = async () => {
    console.log('Give hint called with:', { hidden, isComplete, isSolving });
    if (isComplete || isSolving) return;
    if (hidden === null) {
      console.log('No hidden piece found, setting to last piece');
      setHidden(totalPieces - 1);
      return;
    }

    try {
      // 确保振动反馈
      Vibration.vibrate(20);
      
      const hint = getBestHintMove(pieces, hidden, gridSize);
      if (hint) {
        const newHiddenIndex = hint.indexOf(totalPieces - 1);
        console.log('Applying hint move:', {
          currentState: pieces,
          hintState: hint,
          oldHidden: hidden,
          newHidden: newHiddenIndex
        });
        
        // 使用 requestAnimationFrame 来优化状态更新
        requestAnimationFrame(() => {
          setPieces(hint);
          setHidden(newHiddenIndex);
          setMoves(prev => (prev !== null ? prev + 1 : 1));
        });
        
        // 异步保存移动
        await saveMovesToFirebase();
      } else {
        console.log('No hint available');
      }
    } catch (error) {
      console.error('Error in giveHint:', error);
    }
  };

  const isPuzzleLocked = isComplete;

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
          <Text style={styles.movesText}>Moves: {moves !== null ? moves : '...'}</Text>
          {pieces.length > 0?
          <PicturePuzzle
                  size={Dimensions.get('window').width - 40}
                  pieces={pieces}
                  hidden={hidden}
                  onChange={isPuzzleLocked ? () => {} : handleChange}
                  source={source}
                />
            :null}
          {isComplete && (
            <View style={styles.overlay}>
              <Text style={styles.completedText}>🎉 Puzzle Completed!</Text>
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => {
                  router.push({
                    pathname: "/(protected)/(tabs)/(mapstack)/validateCamera",
                    params: {
                      puzzleId,
                      playId,
                      moves: moves?.toString(),
                      originalImageUri: imageUri,
                      locationName,
                      creatorId,
                      difficulty
                    }
                  });
                }}
              >
                <Text style={styles.verifyText}>Verify</Text>
              </TouchableOpacity>
            </View>
          )}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  completedText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: colors.Primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  verifyText: {
    color: 'white',
    fontSize: 16,
  },
}); 