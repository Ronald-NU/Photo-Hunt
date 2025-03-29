import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TouchableButton from "@/components/TouchableButton";
import { GeneralStyle } from "@/constants/Styles";

type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function NewGameScreen() {
  const [locationName, setLocationName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const router = useRouter();

  const handleTakePhoto = () => {
    if (!locationName.trim()) {
      Alert.alert("Notice", "Please enter a location name");
      return;
    }
    
    // Navigate to camera with location and difficulty params
    router.push({
      pathname: "camera",
      params: {
        locationName,
        difficulty,
      }
    });
  };

  return (
    <SafeAreaView style={[GeneralStyle.container, styles.container]}>
      <Text style={GeneralStyle.title}>New Game</Text>
      
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter location name"
        value={locationName}
        onChangeText={setLocationName}
      />

      <Text style={styles.label}>Puzzle Difficulty</Text>
      <View style={styles.difficultyContainer}>
        {['Easy', 'Medium', 'Hard'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.difficultyButton,
              difficulty === level && styles.selectedDifficulty,
            ]}
            onPress={() => setDifficulty(level as Difficulty)}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === level && styles.selectedDifficultyText,
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.description}>
        Create a New Photo Hunt for both your friends and others!
      </Text>

      <TouchableButton
        title="Take Photo"
        onPress={handleTakePhoto}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  difficultyButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  difficultyText: {
    color: '#333',
  },
  selectedDifficultyText: {
    color: '#fff',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
});