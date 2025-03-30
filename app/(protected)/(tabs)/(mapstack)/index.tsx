import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GeneralStyle } from '@/constants/Styles';
import LocationManager from '@/components/LocationManager';
import { useSelectedLocation } from '@/components/SelectedLocationContext';
import { PuzzleData } from '@/Firebase/DataStructures';
import { getLocalPuzzles } from '@/Firebase/firebaseHelperPuzzles';

export interface SelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const router = useRouter();
  const { selectedLocation, setSelectedLocation } = useSelectedLocation();
  const [allPuzzles, setAllPuzzles] = useState<PuzzleData[]>([]);

  const fetchPuzzles = useCallback(async () => {
    try {
      const puzzles = await getLocalPuzzles({
        latitude: selectedLocation?.latitude || 37.78825,
        longitude: selectedLocation?.longitude || -122.4324
      });
      console.log('Fetched puzzles:', puzzles); // Debug log
      setAllPuzzles(puzzles);
    } catch (error) {
      console.error('Error fetching puzzles:', error);
    }
  }, [selectedLocation]);

  // Fetch puzzles when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Map screen focused, fetching puzzles...'); // Debug log
      fetchPuzzles();
    }, [fetchPuzzles])
  );

  const navigateToLeaderboard = () => {
    router.push("leaderboard");
  };

  const handleLocationSelect = (location: SelectedLocation | null) => {
    setSelectedLocation(location);
  };

  return (
    <View style={GeneralStyle.container}>
      <LocationManager 
        onLocationSelect={handleLocationSelect}
        allPuzzles={allPuzzles}
      />
      
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>{selectedLocation.name}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.leaderboardButton} 
        onPress={navigateToLeaderboard}
      >
        <Ionicons name="trophy-outline" size={30} color="black" />
      </TouchableOpacity>

      {!selectedLocation && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Tap on the map to select a location first
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  leaderboardButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
  },
  locationInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  instructionContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});