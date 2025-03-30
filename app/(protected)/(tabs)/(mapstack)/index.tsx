import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GeneralStyle } from '@/constants/Styles';
import LocationManager from '@/components/LocationManager';
import { useSelectedLocation } from '@/components/SelectedLocationContext';
import { PuzzleData } from '@/Firebase/DataStructures';
import { getLocalPuzzles } from '@/Firebase/firebaseHelperPuzzles';
import type { Region } from 'react-native-maps';
import * as Location from 'expo-location';

export interface SelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const router = useRouter();
  const { selectedLocation, setSelectedLocation } = useSelectedLocation();
  const [allPuzzles, setAllPuzzles] = useState<PuzzleData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const fetchPuzzles = useCallback(async () => {
    try {
      const currentLocation = await getCurrentLocation();
      const latitude = currentLocation?.coords.latitude || selectedLocation?.latitude || 37.78825;
      const longitude = currentLocation?.coords.longitude || selectedLocation?.longitude || -122.4324;

      const puzzles = await getLocalPuzzles({
        latitude,
        longitude
      });
      console.log('Fetched puzzles:', puzzles);
      setAllPuzzles(puzzles);
      
      // Reset map to current location
      if (mapRef.current) {
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        mapRef.current.animateToRegion(region, 1000);
      }
    } catch (error) {
      console.error('Error fetching puzzles:', error);
    }
  }, [selectedLocation]);

  useFocusEffect(
    useCallback(() => {
      console.log('Map screen focused, fetching puzzles...');
      fetchPuzzles();
    }, [fetchPuzzles])
  );

  const navigateToLeaderboard = () => {
    router.push("leaderboard");
  };

  const handleLocationSelect = (location: SelectedLocation | null) => {
    setSelectedLocation(location);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) return;

    const foundPuzzle = allPuzzles.find(puzzle => 
      puzzle.name.toLowerCase().includes(text.toLowerCase())
    );

    if (foundPuzzle) {
      const region: Region = {
        latitude: foundPuzzle.geoLocation.latitude,
        longitude: foundPuzzle.geoLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 1000);
    }
  };

  const handleRefresh = useCallback(async () => {
    // Clear search query
    setSearchQuery('');
    // Fetch new puzzles and reset map
    await fetchPuzzles();
  }, [fetchPuzzles]);

  return (
    <View style={GeneralStyle.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity 
          style={styles.leaderboardButton} 
          onPress={navigateToLeaderboard}
        >
          <Ionicons name="trophy-outline" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search puzzle by name..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#666"
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <LocationManager 
        ref={mapRef}
        onLocationSelect={handleLocationSelect}
        allPuzzles={allPuzzles}
      />
      
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>{selectedLocation.name}</Text>
        </View>
      )}

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
  topContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    gap: 10,
  },
  leaderboardButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  refreshButton: {
    padding: 5,
    marginLeft: 5,
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
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