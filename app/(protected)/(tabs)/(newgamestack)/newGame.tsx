import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TouchableButton from "@/components/TouchableButton";
import { GeneralStyle } from "@/constants/Styles";
import { Ionicons } from '@expo/vector-icons';
import { useSelectedLocation } from '@/components/SelectedLocationContext';
import { useUser } from '@/components/UserContext';
import CreateAccountModal from '@/components/CreateAccountModal';
import { auth } from '@/Firebase/firebaseSetup';
import { colors } from '@/constants/Colors';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function NewGameScreen() {

  const [puzzleName, setPuzzleName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const router = useRouter();
  const { selectedLocation } = useSelectedLocation();
  const {user} = useUser();
  const [createAccountModal, setCreatAccountModal] = useState(false);
  
    useFocusEffect(
      useCallback(() => {
        if (user == null) {
          setCreatAccountModal(true);
        } else {
          setCreatAccountModal(false);
        }
      }, [user])
    );

  const handleTakePhoto = () => {
    if (!puzzleName.trim()) {
      Alert.alert("Notice", "Please enter a puzzle name");
      return;
    }

    if (!selectedLocation) {
      Alert.alert(
        "Location Required",
        "Please select a location on the map first",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
      return;
    }
    
    router.push({
      pathname: "camera",
      params: {
        locationName: puzzleName,
        difficulty,
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
      }
    });
  };

  const signUp = () => {
    auth.signOut();router.replace("signup");setCreatAccountModal(false);
  }

  const cancel = () => {
    router.replace("(mapstack)");setCreatAccountModal(false);
  }


  return (
    <SafeAreaView style={[GeneralStyle.container, styles.container]}>
      <CreateAccountModal isOpen={createAccountModal} onClose={cancel} onSignUp={signUp} />
      <View style={styles.titleContainer}>
        <Text style={[GeneralStyle.title, styles.title]}>New Game</Text>
      </View>
      
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter puzzle name"
        value={puzzleName}
        onChangeText={setPuzzleName}
      />

      <Text style={styles.label}>Selected Location</Text>
      <View style={styles.locationContainer}>
        <View style={styles.locationContent}>
          <Ionicons name="location" size={24} color="#00A9E0" />
          <Text style={styles.locationText}>
            {selectedLocation?.name || "No location selected"}
          </Text>
        </View>
      </View>

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
  titleContainer: {
    marginBottom: 40,
    marginTop: -20,
  },
  title: {
    fontSize: 32,
    color: '#00A9E0',
  },
  label: {
    fontSize: 16,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 10,
    color: colors.Grey,
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
    color: colors.Grey,
    marginVertical: 20,
  },
});