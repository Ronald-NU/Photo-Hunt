import { View, Text, StyleSheet, Image, Button, TouchableOpacity, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle, TextStyles } from "@/constants/Styles";

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { locationName, difficulty } = params;
  
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  useEffect(() => {
    (async () => {
      if (!locationPermission?.granted) {
        const permissionResult = await requestLocationPermission();
        if (!permissionResult.granted) {
          alert("You need to grant location permissions to create a puzzle");
          router.back();
        }
      }
    })();
  }, []);

  const verifyPermissions = async () => {
    // Verify camera permission
    if (!cameraPermission?.granted) {
      const cameraResult = await requestCameraPermission();
      if (!cameraResult.granted) {
        alert("You need to grant camera permissions to take a photo");
        return false;
      }
    }

    // Verify location permission
    if (!locationPermission?.granted) {
      const locationResult = await requestLocationPermission();
      if (!locationResult.granted) {
        alert("You need to grant location permissions to create a puzzle");
        return false;
      }
    }

    return true;
  };
  
  const takeImageHandler = async () => {
    setLoading(true);
    try {
      const hasPermissions = await verifyPermissions();
      if (!hasPermissions) return;

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Changed to 1:1 for better puzzle creation
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
      } else {
        alert("No image was selected.");
      }
    } catch (err) {
      console.log('Error taking photo:', err);
      alert('Failed to take photo: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePuzzle = () => {
    if (!location) {
      alert("Location data is not available. Please try again.");
      return;
    }

    // Navigate to puzzle screen with all necessary data
    router.push({
      pathname: "puzzle",
      params: {
        imageUri,
        difficulty,
        locationName,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    });
  };
  
  return (
    <SafeAreaView style={[GeneralStyle.container, styles.safeArea]}>
      <View style={styles.imagePreview}>
        {loading ? (
          <Text style={TextStyles.mediumText}>Loading image...</Text>
        ) : imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="contain"
          />
        ) : (
          <Text style={[TextStyles.mediumText, {position:'absolute', top:'40%'}]}>
            No image taken yet.
          </Text>
        )}
      </View>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.cameraButton} 
          onPress={takeImageHandler}
          disabled={loading}
        >
          <View style={[
            styles.cameraButtonInner, 
            loading && {backgroundColor: 'darkgray'}
          ]} />
        </TouchableOpacity>
        
        {imageUri && !loading && (
          <View style={styles.buttonContainer}>
            <Button
              title="Create Puzzle"
              onPress={handleCreatePuzzle}
            />
            <Button
              title="Take Another"
              onPress={takeImageHandler}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Add padding to account for bottom tab bar
  },
  imagePreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  image: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 20,
  },
  cameraButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: 'gray',
  },
  cameraButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'lightgray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});