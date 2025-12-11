import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GeneralStyle } from '@/constants/Styles';
import LocationManager from '@/components/LocationManager';
import { useSelectedLocation } from '@/components/SelectedLocationContext';
import { PuzzleData } from '@/Firebase/DataStructures';
import { getLocalPuzzles } from '@/Firebase/firebaseHelperPuzzles';
import type { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '@/constants/Colors';
import * as Notifications from 'expo-notifications';
import { verifyPermissions } from '@/components/NotificationManager';
import { auth } from '@/Firebase/firebaseSetup';
import { onAuthStateChanged } from 'firebase/auth';

export interface SelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';


export default function MapScreen() {
  const router = useRouter();
  const { selectedLocation, setSelectedLocation } = useSelectedLocation();
  const [allPuzzles, setAllPuzzles] = useState<PuzzleData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [targetRegion, setTargetRegion] = useState<Region | null>(null);
  const [foundPuzzle, setFoundPuzzle] = useState<PuzzleData | null>(null);

  useEffect(()=>{
    const NotificationSetup = async () => {
      if(await verifyPermissions()){
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ 
      shouldShowAlert: true, 
      shouldPlaySound: true, 
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true
    })
  });
    }
    }
  NotificationSetup()
  },[])

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

      if (!auth.currentUser) {
        console.log('User not logged in, skipping puzzle fetch');
        return;
      }
      
      //console.log('Fetching puzzles...');
      const currentLocation = await getCurrentLocation();
     // console.log('Current location:', currentLocation);
      
      const latitude = currentLocation?.coords.latitude || selectedLocation?.latitude || 37.78825;
      const longitude = currentLocation?.coords.longitude || selectedLocation?.longitude || -122.4324;
      //console.log('Using coordinates:', { latitude, longitude });

      const puzzles = await getLocalPuzzles({
        latitude,
        longitude
      });
     // console.log('Fetched puzzles:', puzzles);
      setAllPuzzles(puzzles);
      
      // Reset map to current location
      if (mapRef.current) {
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        //console.log('Animating map to region:', region);
        mapRef.current.animateToRegion(region, 1000);
      }
    } catch (error) {
      console.error('Error fetching puzzles:', error);
    }
  }, [selectedLocation]);

  // Listen to authentication state changes, ensure puzzles are fetched after user login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User logged in, fetching puzzles...');
        fetchPuzzles();
      } else {
        console.log('User logged out, clearing puzzles...');
        setAllPuzzles([]);
      }
    });
    
    return () => unsubscribe();
  }, [fetchPuzzles]);

  useFocusEffect(
    useCallback(() => {
      // Only fetch puzzles when user is logged in
      if (auth.currentUser) {
        //console.log('Map screen focused, fetching puzzles...');
        fetchPuzzles();
      }
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
    
    // Clear target region and found puzzle when search is cleared
    if (!text.trim()) {
      setTargetRegion(null);
      setFoundPuzzle(null);
      return;
    }

    // Search in filtered puzzles first (respects difficulty filter)
    // If not found, also search in all puzzles (in case it's filtered out)
    const puzzle = filteredPuzzles.find(p => 
      p.name.toLowerCase().includes(text.toLowerCase())
    ) || allPuzzles.find(p => 
      p.name.toLowerCase().includes(text.toLowerCase())
    );

    if (puzzle) {
      const region: Region = {
        latitude: puzzle.geoLocation.latitude,
        longitude: puzzle.geoLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      console.log('🔍 Found puzzle:', puzzle.name);
      console.log('📍 Navigating to coordinates:', {
        latitude: puzzle.geoLocation.latitude,
        longitude: puzzle.geoLocation.longitude
      });
      
      // Store found puzzle to show in UI
      setFoundPuzzle(puzzle);
      
      // Use targetRegion prop to update map (more reliable than direct ref)
      setTargetRegion(region);
      
      // Also try direct ref as fallback
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    } else {
      setFoundPuzzle(null);
      console.log('❌ Puzzle not found in loaded puzzles:', text);
      console.log('📊 Total puzzles loaded:', allPuzzles.length);
      console.log('📋 Available puzzle names:', allPuzzles.map(p => p.name));
      console.log('💡 Note: Only puzzles within 100 miles are loaded. ' +
                  'If the puzzle is far away, try moving closer or refreshing.');
    }
  };

  const handleEnterPuzzle = () => {
    if (!foundPuzzle) return;
    
    router.push({
      pathname: "/(protected)/(tabs)/(mapstack)/markerScreen",
      params: {
        puzzleId: foundPuzzle.id,
        puzzleName: foundPuzzle.name,
        creatorId: foundPuzzle.creatorID,
        difficulty: foundPuzzle.difficulty.toString(),
        imageUri: foundPuzzle.photoURL,
      }
    });
  };

  const handleRefresh = useCallback(async () => {
    // Clear search query, target region, and found puzzle
    setSearchQuery('');
    setTargetRegion(null);
    setFoundPuzzle(null);
    // Fetch new puzzles and reset map
    await fetchPuzzles();
  }, [fetchPuzzles]);

  const filteredPuzzles = allPuzzles.filter(puzzle => {
    if (difficultyFilter === 'all') return true;
    switch (difficultyFilter) {
      case 'easy':
        return puzzle.difficulty === 3;
      case 'medium':
        return puzzle.difficulty === 4;
      case 'hard':
        return puzzle.difficulty === 5;
      default:
        return true;
    }
  });

  const handleDifficultyFilter = (filter: DifficultyFilter) => {
    setDifficultyFilter(filter);
  };

  return (
    <View style={GeneralStyle.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity 
          style={styles.leaderboardButton} 
          onPress={navigateToLeaderboard}
        >
          <Ionicons name="trophy-outline" size={24} color={colors.Black} />
        </TouchableOpacity>

        <View style={GeneralStyle.searchContainer}>
          <Ionicons name="search" size={20} color={colors.Grey} style={GeneralStyle.searchIcon} />
          <TextInput
            style={GeneralStyle.searchInput}
            placeholder="Search puzzle by name..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.Grey}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={GeneralStyle.clearButton}
              onPress={() => {
                setSearchQuery('');
                setFoundPuzzle(null);
                setTargetRegion(null);
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.Grey} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={GeneralStyle.refreshButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={20} color={colors.Grey} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, difficultyFilter === 'all' && styles.filterButtonActive]}
          onPress={() => handleDifficultyFilter('all')}
        >
          <Text style={[styles.filterText, difficultyFilter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, difficultyFilter === 'easy' && styles.filterButtonActive]}
          onPress={() => handleDifficultyFilter('easy')}
        >
          <Text style={[styles.filterText, difficultyFilter === 'easy' && styles.filterTextActive]}>Easy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, difficultyFilter === 'medium' && styles.filterButtonActive]}
          onPress={() => handleDifficultyFilter('medium')}
        >
          <Text style={[styles.filterText, difficultyFilter === 'medium' && styles.filterTextActive]}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, difficultyFilter === 'hard' && styles.filterButtonActive]}
          onPress={() => handleDifficultyFilter('hard')}
        >
          <Text style={[styles.filterText, difficultyFilter === 'hard' && styles.filterTextActive]}>Hard</Text>
        </TouchableOpacity>
      </View>

      <LocationManager 
        ref={mapRef}
        onLocationSelect={handleLocationSelect}
        allPuzzles={filteredPuzzles}
        targetRegion={targetRegion}
      />
      
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>{selectedLocation.name}</Text>
        </View>
      )}

      {/* Show found puzzle card when search finds a match */}
      {foundPuzzle && (
        <View style={styles.foundPuzzleCard}>
          <View style={styles.foundPuzzleInfo}>
            <Ionicons name="location" size={24} color={colors.Primary} />
            <View style={styles.foundPuzzleTextContainer}>
              <Text style={styles.foundPuzzleName}>{foundPuzzle.name}</Text>
              <Text style={styles.foundPuzzleDifficulty}>
                Difficulty: {foundPuzzle.difficulty === 3 ? 'Easy' : foundPuzzle.difficulty === 4 ? 'Medium' : 'Hard'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.enterPuzzleButton}
            onPress={handleEnterPuzzle}
          >
            <Text style={styles.enterPuzzleButtonText}>Enter Puzzle</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.White} />
          </TouchableOpacity>
        </View>
      )}

      {!selectedLocation && !foundPuzzle && (
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
    backgroundColor: colors.White,
    padding: 10,
    borderRadius: 8,
    shadowColor: colors.Black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: colors.White,
    padding: 15,
    borderRadius: 10,
    shadowColor: colors.Black,
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
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  filterContainer: {
    position: 'absolute',
    top: 106,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    backgroundColor: colors.White,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: 'hidden',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    minWidth: 65,
    alignItems: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    color: colors.Grey,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color:  colors.White,
  },
  foundPuzzleCard: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: colors.White,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.Black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 10,
  },
  foundPuzzleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foundPuzzleTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  foundPuzzleName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.Black,
    marginBottom: 4,
  },
  foundPuzzleDifficulty: {
    fontSize: 14,
    color: colors.Grey,
  },
  enterPuzzleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.Primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  enterPuzzleButtonText: {
    color: colors.White,
    fontSize: 16,
    fontWeight: '600',
  },
});