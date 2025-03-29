import React, { useState, useEffect, useCallback } from 'react';
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, Alert, View, ActivityIndicator } from 'react-native';
import { SelectedLocation } from '@/app/(protected)/(tabs)/(mapstack)';
import { PuzzleData } from '@/Firebase/DataStructures';
import { getLocalPuzzles } from '@/Firebase/firebaseHelperPuzzles';

interface LocationManagerProps {
  onLocationSelect: (location: SelectedLocation | null) => void;
  searchResults?: PuzzleData[];
}

const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function LocationManager({ onLocationSelect, searchResults = [] }: LocationManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentRegion, setCurrentRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedMarker, setSelectedMarker] = useState<SelectedLocation | null>(null);
  const [localPuzzles, setLocalPuzzles] = useState<PuzzleData[]>([]);

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

        if (isMounted) {
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setCurrentRegion(newRegion);
          
          const puzzles = await getLocalPuzzles({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          setLocalPuzzles(puzzles);
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

  const allPuzzles = React.useMemo(() => {
    const puzzleMap = new Map<string, PuzzleData>();
    localPuzzles.forEach(puzzle => puzzleMap.set(puzzle.id, puzzle));
    searchResults.forEach(puzzle => puzzleMap.set(puzzle.id, puzzle));
    return Array.from(puzzleMap.values());
  }, [localPuzzles, searchResults]);

  if (isLoading) {
    return (
      <View style={[styles.map, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00A9E0" />
      </View>
    );
  }

  return (
    <MapView
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
          pinColor="red"
          title={selectedMarker.name}
        />
      )}

      {allPuzzles.map((puzzle) => (
        <Marker
          key={puzzle.id}
          coordinate={{
            latitude: puzzle.geoLocation.latitude,
            longitude: puzzle.geoLocation.longitude,
          }}
          pinColor="green"
          title={puzzle.name}
          description={`Difficulty: ${puzzle.difficulty === 3 ? 'Easy' : puzzle.difficulty === 4 ? 'Medium' : 'Hard'}`}
        />
      ))}
    </MapView>
  );
}

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