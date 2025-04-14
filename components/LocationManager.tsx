import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, Alert, View, ActivityIndicator } from 'react-native';
import { SelectedLocation } from '@/app/(protected)/(tabs)/(mapstack)';
import { PuzzleData } from '@/Firebase/DataStructures';
import { useRouter } from 'expo-router';
import { useUser } from '@/components/UserContext';

interface LocationManagerProps {
  onLocationSelect: (location: SelectedLocation | null) => void;
  allPuzzles?: PuzzleData[];
}

const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const LocationManager = forwardRef<MapView, LocationManagerProps>(({ onLocationSelect, allPuzzles = [] }, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedMarker, setSelectedMarker] = useState<SelectedLocation | null>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    //console.log('LocationManager received puzzles:', allPuzzles);
  }, [allPuzzles]);

  useEffect(() => {
    let isMounted = true;

    const initializeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for this feature.');
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      //  console.log('Current location:', location);

        if (isMounted) {
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setCurrentRegion(newRegion);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing location:', error);
        Alert.alert('Error', 'Failed to get your location. Please check your location settings.');
        setIsLoading(false);
      }
    };

    initializeLocation();
    return () => { isMounted = false; };
  }, []);

  const handleMapPress = useCallback(async (event: MapPressEvent) => {
    try {
      const { coordinate } = event.nativeEvent;
      const address = await Location.reverseGeocodeAsync(coordinate);

      if (address && address.length > 0) {
        const locationData: SelectedLocation = {
          name: address[0].name || `${address[0].street || ''} ${address[0].city || ''}`.trim() || 'Selected Location',
          latitude: coordinate.latitude,
          longitude: coordinate.longitude
        };
        
        setSelectedMarker(locationData);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error getting location name:', error);
      Alert.alert('Error', 'Failed to get location name. Please try again.');
    }
  }, [onLocationSelect]);

  const handlePuzzlePress = useCallback(async (puzzle: PuzzleData) => {
    console.log('Puzzle pressed:', puzzle);
    
    // Navigate to marker screen
    router.push({
      pathname: "/(protected)/(tabs)/(mapstack)/markerScreen",
      params: {
        puzzleId: puzzle.id,
        puzzleName: puzzle.name,
        creatorId: puzzle.creatorID,
        difficulty: puzzle.difficulty.toString(),
        imageUri: puzzle.photoURL,
      }
    });
  }, [router]);
  const getMarkerColor = (difficulty: number) => {
    switch (difficulty) {
      case 3: // Easy
        return '#4CAF50'; // 绿色
      case 4: // Medium
        return '#FFC107'; // 黄色
      case 5: // Hard
        return '#F44336'; // 红色
      default:
        return '#2196F3'; // 默认蓝色
    }
  };
  if (isLoading) {
    return (
      <View style={[styles.map, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00A9E0" />
      </View>
    );
  }

  return (
    <MapView
      ref={ref}
      style={styles.map}
      initialRegion={currentRegion}
      onPress={handleMapPress}
      showsUserLocation
      showsMyLocationButton
      showsCompass
    >
      {selectedMarker && (
        <Marker
          coordinate={{
            latitude: selectedMarker.latitude,
            longitude: selectedMarker.longitude,
          }}
          pinColor="#2196F3"  // 蓝色
          title={selectedMarker.name}
        />
      )}

      {allPuzzles.map((puzzle) => {

        return (
          <Marker
            key={puzzle.id}
            coordinate={{
              latitude: puzzle.geoLocation.latitude,
              longitude: puzzle.geoLocation.longitude,
            }}
            pinColor={getMarkerColor(puzzle.difficulty)}
            title={puzzle.name}
            description={`Difficulty: ${puzzle.difficulty === 3 ? 'Easy' : puzzle.difficulty === 4 ? 'Medium' : 'Hard'}`}
            onPress={() => handlePuzzlePress(puzzle)}
          />
        );
      })}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default LocationManager;