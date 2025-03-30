import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";

export default function ViewPuzzleScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { imageUri, difficulty, locationName, isFromMyPuzzles, isFromMap, isSaved } = params;

  const handleBack = () => {
    if (isFromMyPuzzles === "true") {
      // If viewing from MyPuzzles, go back to MyPuzzles
      router.back();
    } else if (params.isFromMap === "true") {
      // If viewing from Map, go back to Map
      router.push("/(protected)/(tabs)/(mapstack)");
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
          title: locationName as string,
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Text style={styles.title}>{locationName as string}</Text>
              <Text style={styles.difficulty}>Difficulty: {difficulty}</Text>
            </View>
          )
        }}
      />

      <View style={styles.puzzleContainer}>
        <Image
          style={{
            width: Dimensions.get('window').width - 40,
            height: Dimensions.get('window').width - 40,
            resizeMode: 'contain'
          }}
          source={{ uri: imageUri as string }}
        />
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
    color: '#666',
  },
  puzzleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }
}); 