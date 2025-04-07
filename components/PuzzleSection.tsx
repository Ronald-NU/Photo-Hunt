import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { PuzzleMiniData } from '@/Firebase/DataStructures'
import { colors } from '@/constants/Colors'

type PuzzleSectionProps = {
    onPress: (item:PuzzleMiniData) => void
    item: PuzzleMiniData
}
const PuzzleSection = ({onPress, item}:PuzzleSectionProps) => {
    
    const getDifficultyText = (difficulty: number) => {
        switch(difficulty) {
          case 3: return "Easy";
          case 4: return "Medium";
          case 5: return "Hard";
          default: return "Unknown";
        }
      };

  return (
    <TouchableOpacity 
                style={styles.puzzleItem}
                onPress={() => onPress(item)}
              >
                <Text style={styles.puzzleName} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
                <Text style={styles.difficulty}>{getDifficultyText(item.difficulty)}</Text>
              </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
      puzzleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginVertical: 5,
        backgroundColor: colors.White,
        borderRadius: 10,
        shadowColor: colors.Black,
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
        color: colors.Grey,
        minWidth: 80,
        textAlign: 'right',
      },
})

export default PuzzleSection