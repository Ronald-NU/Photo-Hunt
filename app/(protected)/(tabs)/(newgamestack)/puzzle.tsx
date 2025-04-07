import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Image, TextInput, Vibration, ViewStyle } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { PicturePuzzle } from 'react-native-picture-puzzle';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { useUser } from "@/components/UserContext";
import { PuzzleMiniData, PuzzleData } from "@/Firebase/DataStructures";
import { createPuzzleDocument } from "@/Firebase/firebaseHelperPuzzles";
import { updateUserDocument, getUserData } from "@/Firebase/firebaseHelperUsers";
import { colors } from '@/constants/Colors';

const PUZZLE_SIZE = {
  Easy: 3, // 3x3 grid (9 pieces)
  Medium: 4, // 4x4 grid (16 pieces)
  Hard: 5, // 5x5 grid (25 pieces)
};

interface GridLinesProps {
  size: number;
  gridSize: number;
}

interface Position {
  row: number;
  col: number;
}

interface Move {
  from: Position;
  to: Position;
}

interface PuzzleState {
  pieces: number[];
  emptyPos: number;
  g: number;  // 从起始状态到当前状态的实际代价
  h: number;  // 启发式估计到目标状态的代价
  f: number;  // f = g + h
  parent: PuzzleState | null;
  lastMove: Position | null;
}

// GridLines component
const GridLines: React.FC<GridLinesProps> = memo(({ size, gridSize }) => {
  const lines = [];
  for (let i = 1; i < gridSize; i++) {
    const position = (size / gridSize) * i;
    lines.push(
      <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: position }]} />
    );
    lines.push(
      <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: position }]} />
    );
  }
  return <View style={styles.gridLines}>{lines}</View>;
});

interface DragHintProps {
  position: {
    top: number;
    left: number;
  };
}

// DragHint component
const DragHint: React.FC<DragHintProps> = memo(({ position }) => {
  return (
    <View style={[styles.dragHint, { ...position }]}>
      <Ionicons name="arrow-forward" size={24} color="#007AFF" />
    </View>
  );
});

interface EdgeIndicatorProps {
  side: 'left' | 'right';
}

// EdgeIndicator component
const EdgeIndicator: React.FC<EdgeIndicatorProps> = memo(({ side }) => {
  return (
    <View style={[styles.edgeIndicator, side === 'left' ? styles.leftEdge : styles.rightEdge]} />
  );
});

interface HintArrowProps {
  from: Position;
  to: Position;
  gridSize: number;
  pieceSize: number;
}

const HintArrow: React.FC<HintArrowProps> = memo(({ from, to, gridSize, pieceSize }) => {
  // 计算箭头的起点和终点（以拼图块的中心为基准）
  const startX = (from.col + 0.5) * pieceSize;
  const startY = (from.row + 0.5) * pieceSize;
  const endX = (to.col + 0.5) * pieceSize;
  const endY = (to.row + 0.5) * pieceSize;

  // 计算箭头的长度和角度
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI); // 转换为角度

  // 根据移动方向确定箭头图标
  let arrowName: "arrow-forward" | "arrow-back" | "arrow-down" | "arrow-up" = "arrow-forward";
  if (Math.abs(angle) < 45) {
    arrowName = "arrow-forward";
  } else if (Math.abs(angle) > 135) {
    arrowName = "arrow-back";
  } else if (angle > 0) {
    arrowName = "arrow-down";
  } else {
    arrowName = "arrow-up";
  }

  console.log('HintArrow Debug:', {
    from,
    to,
    startX,
    startY,
    endX,
    endY,
    length,
    angle,
    arrowName,
    pieceSize
  });

  return (
    <View style={styles.hintContainer}>
      {/* 连接线 */}
      <View
        style={[
          styles.hintArrow,
          {
            position: 'absolute',
            left: startX,
            top: startY,
            width: length,
            transform: [
              { translateX: -length / 2 },
              { translateY: -2 },
              { rotate: `${angle}deg` },
              { translateX: length / 2 }
            ]
          }
        ]}
      />
      
      {/* 箭头图标 */}
      <View
        style={[
          styles.hintArrowIcon,
          {
            position: 'absolute',
            left: startX - 15,
            top: startY - 15,
          }
        ]}
      >
        <Ionicons name={arrowName} size={30} color="#007AFF" />
      </View>
    </View>
  );
});

// 辅助函数
const posToIndex = (pos: Position, gridSize: number): number => {
  return pos.row * gridSize + pos.col;
};

const indexToPos = (index: number, gridSize: number): Position => {
  return {
    row: Math.floor(index / gridSize),
    col: index % gridSize
  };
};

const getManhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

const getHeuristic = (pieces: number[], gridSize: number): number => {
  let totalDistance = 0;
  pieces.forEach((piece, currentIndex) => {
    if (piece !== currentIndex && piece !== null) {
      const currentPos = indexToPos(currentIndex, gridSize);
      const targetPos = indexToPos(piece, gridSize);
      totalDistance += getManhattanDistance(currentPos, targetPos);
    }
  });
  return totalDistance;
};

const getValidMoves = (emptyPos: Position, gridSize: number): Position[] => {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 },  // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 }   // 右
  ];

  for (const dir of directions) {
    const newRow = emptyPos.row + dir.row;
    const newCol = emptyPos.col + dir.col;
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      moves.push({ row: newRow, col: newCol });
    }
  }
  return moves;
};

const createNewState = (
  currentState: PuzzleState,
  emptyPos: Position,
  movePos: Position,
  gridSize: number
): PuzzleState => {
  const newPieces = [...currentState.pieces];
  const emptyIndex = posToIndex(emptyPos, gridSize);
  const moveIndex = posToIndex(movePos, gridSize);
  
  // 交换空格和移动的拼图块
  [newPieces[emptyIndex], newPieces[moveIndex]] = [newPieces[moveIndex], newPieces[emptyIndex]];
  
  const h = getHeuristic(newPieces, gridSize);
  return {
    pieces: newPieces,
    emptyPos: moveIndex,
    g: currentState.g + 1,
    h,
    f: currentState.g + 1 + h,
    parent: currentState,
    lastMove: movePos
  };
};

const stateToString = (state: PuzzleState): string => {
  return state.pieces.join(',');
};

const findPath = (
  initialPieces: number[],
  hidden: number,
  gridSize: number
): Position[] | null => {
  const initialState: PuzzleState = {
    pieces: [...initialPieces],
    emptyPos: hidden,
    g: 0,
    h: getHeuristic(initialPieces, gridSize),
    f: getHeuristic(initialPieces, gridSize),
    parent: null,
    lastMove: null
  };

  const openSet = new Map<string, PuzzleState>();
  const closedSet = new Set<string>();
  openSet.set(stateToString(initialState), initialState);

  while (openSet.size > 0) {
    // 找到 f 值最小的状态
    let currentState = Array.from(openSet.values()).reduce((a, b) => 
      a.f < b.f ? a : b
    );
    
    // 如果找到目标状态（所有拼图块都在正确位置）
    if (currentState.h === 0) {
      // 重建路径
      const path: Position[] = [];
      while (currentState.parent && currentState.lastMove) {
        path.unshift(currentState.lastMove);
        currentState = currentState.parent;
      }
      return path;
    }

    // 从开放列表中移除当前状态
    openSet.delete(stateToString(currentState));
    closedSet.add(stateToString(currentState));

    // 获取空格位置
    const emptyPos = indexToPos(currentState.emptyPos, gridSize);
    
    // 获取所有可能的移动
    const validMoves = getValidMoves(emptyPos, gridSize);
    
    // 检查每个可能的移动
    for (const movePos of validMoves) {
      const newState = createNewState(currentState, emptyPos, movePos, gridSize);
      const stateStr = stateToString(newState);
      
      // 如果这个状态已经访问过，跳过
      if (closedSet.has(stateStr)) continue;
      
      // 如果这是一个新状态或者找到了更好的路径
      const existingState = openSet.get(stateStr);
      if (!existingState || newState.f < existingState.f) {
        openSet.set(stateStr, newState);
      }
    }
  }

  return null; // 没有找到解决方案
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
  const [showHint, setShowHint] = useState(false);
  const [nextMove, setNextMove] = useState<Move | null>(null);

  const { imageUri, difficulty, locationName, latitude, longitude, isFromMyPuzzles } = params;
  const isViewMode = isFromMyPuzzles === "true";
  const gridSize = PUZZLE_SIZE[difficulty as keyof typeof PUZZLE_SIZE];
  const totalPieces = gridSize * gridSize;

  const puzzleSize = Dimensions.get('window').width - 30;

  useEffect(() => {
    const initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
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

  // 获取用户文档ID
  useEffect(() => {
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

  const handleSave = useCallback(async () => {
    if (!user) {
      Alert.alert("Error", "Please log in to save puzzles.");
      return;
    }

    try {
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

      const puzzleDocId = await createPuzzleDocument(user.uid, puzzleData);
      
      if (!puzzleDocId) {
        throw new Error("Failed to create puzzle document");
      }

      const currentUserData = await getUserData(user.uid);
      
      if (!currentUserData) {
        throw new Error("Failed to get user data");
      }

      const newPuzzle: PuzzleMiniData = {
        id: puzzleData.id,
        name: puzzleData.name,
        difficulty: puzzleData.difficulty
      };

      const updatedMypuzzles = currentUserData.mypuzzles ? [...currentUserData.mypuzzles, newPuzzle] : [newPuzzle];

      await updateUserDocument(currentUserData.id, {
        mypuzzles: updatedMypuzzles
      });

      setIsSaved(true);

      Alert.alert(
        "Puzzle Saved",
        "Your puzzle has been saved successfully!",
        [
          {
            text: "View My Puzzles",
            onPress: () => {
              router.push({
                pathname: "/(protected)/(tabs)/(profilestack)/profile"
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
  }, [user, locationName, imageUri, gridSize, latitude, longitude, router]);

  const handleChange = useCallback((nextPieces: readonly number[], nextHidden: number | null) => {
    if (isViewMode) return;
    
    console.log('Puzzle State Before Move:', {
      currentPieces: pieces,
      currentHidden: hidden
    });
    
    // 使用函数式更新来确保状态同步
    setPieces(prevPieces => {
      console.log('Updating pieces:', { prevPieces, nextPieces });
      return [...nextPieces];
    });
    setHidden(nextHidden);
    setMoves(prev => prev + 1);
    
    console.log('Puzzle State After Move:', {
      nextPieces,
      nextHidden
    });
    
    const isCorrect = nextPieces.every((piece, index) => piece === index);
    if (isCorrect) {
      setIsComplete(true);
      handleSave();
    }
  }, [isViewMode, handleSave]);

  const handleBack = useCallback(() => {
    if (isViewMode) {
      router.back();
    } else if (!isSaved) {
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
  }, [isViewMode, isSaved, router]);

  const calculateNextMove = useCallback(() => {
    if (!pieces || pieces.length === 0 || hidden === null) return null;

    console.log('Calculate Next Move - Current State:', {
      pieces,
      hidden,
      gridSize
    });

    // 使用 A* 算法找到最优路径
    const path = findPath(pieces, hidden, gridSize);
    
    if (!path || path.length === 0) {
      console.log('No solution found');
      return null;
    }

    // 返回路径中的第一步
    const firstMove = path[0];
    const from = firstMove;
    const to = indexToPos(hidden, gridSize);

    console.log('Next Move Found:', { from, to, fullPath: path });
    
    return { from, to };
  }, [pieces, hidden, gridSize]);

  const handleHint = useCallback(() => {
    console.log('Handle Hint Called - Current State:', {
      pieces,
      hidden,
      gridSize
    });
    
    const move = calculateNextMove();
    console.log('Calculated Next Move:', move);
    
    if (move) {
      setNextMove(move);
      setShowHint(true);
      Vibration.vibrate(50);

      // 计算移动的拼图块的索引
      const fromIndex = posToIndex(move.from, gridSize);
      const toIndex = posToIndex(move.to, gridSize);

      // 创建新的拼图状态
      const nextPieces = [...pieces];
      [nextPieces[fromIndex], nextPieces[toIndex]] = [nextPieces[toIndex], nextPieces[fromIndex]];

      // 延迟执行移动，让用户先看到提示箭头
      setTimeout(() => {
        // 执行移动
        handleChange(nextPieces, fromIndex);
        setShowHint(false);
        setNextMove(null);
      }, 1000); // 1秒后执行移动
    }
  }, [calculateNextMove, pieces, hidden, gridSize, handleChange]);

  const handleComplete = useCallback(() => {
    if (!isViewMode) {
      setIsComplete(true);
      handleSave();
    }
  }, [isViewMode, handleSave]);

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
              <View style={styles.headerRightContainer}>
                <TouchableOpacity onPress={handleHint} style={styles.hintButton}>
                  <Ionicons name="bulb-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={styles.headerButton}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : null
          ),
          title: locationName as string,
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Text style={styles.titleText}>{locationName as string}</Text>
              <Text style={styles.movesText}>
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
                width: puzzleSize,
                height: puzzleSize,
                resizeMode: 'contain'
              }}
              source={{ uri: imageUri as string }}
            />
          ) : (
            <>
              <Text style={styles.hintText}>Tap to move pieces</Text>
              <View style={styles.puzzleWrapper}>
                <PicturePuzzle
                  size={puzzleSize}
                  pieces={pieces}
                  hidden={hidden}
                  onChange={handleChange}
                  source={{ uri: imageUri as string }}
                />
                <GridLines size={puzzleSize} gridSize={gridSize} />
                {showHint && nextMove && (
                  <HintArrow
                    from={nextMove.from}
                    to={nextMove.to}
                    gridSize={gridSize}
                    pieceSize={puzzleSize / gridSize}
                  />
                )}
              </View>
            </>
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
            onPress={() => {
              router.push("/(protected)/(tabs)/(profilestack)/profile");
            }}
          >
            <Text style={styles.buttonText}>Back to Profile</Text>
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
  titleText: {
    fontSize: 17,
    fontWeight: '600',
  },
  movesText: {
    fontSize: 14,
    color: colors.Grey,
  },
  puzzleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  puzzleWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  dragHint: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 20,
  },
  edgeIndicator: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  leftEdge: {
    left: -20,
  },
  rightEdge: {
    right: -20,
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
    color: colors.Grey,
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
    color: colors.White,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintButton: {
    marginRight: 15,
  },
  hintContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  hintArrow: {
    height: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
    position: 'absolute',
    zIndex: 1000,
  },
  hintArrowIcon: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 