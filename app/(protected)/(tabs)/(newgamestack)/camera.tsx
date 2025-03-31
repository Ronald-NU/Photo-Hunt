import { View, Text, StyleSheet, Image, Button, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle, TextStyles } from "@/constants/Styles";
import { validateImage } from '@/utils/imageValidation';

export default function CameraScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string>("");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const { locationName, difficulty } = params;

  const verifyPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Insufficient permissions!',
          'You need to grant camera permissions to use this app.',
          [{ text: 'Okay' }]
        );
        return false;
      }
    }
    return true;
  };

  const takeImageHandler = async () => {
    setLoading(true);
    try {
      const hasPermissions = await verifyPermissions();
      if (!hasPermissions) {
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log('Captured image URI:', uri);
        
        // 验证图像
        const validation = await validateImage(uri);
        console.log('Validation result:', validation);
        
        if (!validation.isValid) {
          Alert.alert(
            "Invalid Photo",
            validation.reason || "Please take a photo of a location or landmark.",
            [
              {
                text: "Try Again",
                onPress: () => {
                  setLoading(false);
                  takeImageHandler();
                }
              },
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => setLoading(false)
              }
            ]
          );
          return;
        }
        
        setImageUri(uri);
      } else {
        Alert.alert("Notice", "No image was selected.");
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Failed to take photo: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePuzzle = () => {
    if (!location) {
      Alert.alert("Error", "Location data is not available. Please try again.");
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
    <SafeAreaView style={GeneralStyle.container}>
      <View style={styles.container}>
        <View style={styles.imagePreview}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00A9E0" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          ) : imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.label}>No image taken yet.</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, !imageUri && styles.primaryButton]}
            onPress={takeImageHandler}
            disabled={loading}
          >
            <Text style={[styles.buttonText, !imageUri && styles.primaryButtonText]}>
              {imageUri ? 'Retake Photo' : 'Take Photo'}
            </Text>
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreatePuzzle}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Create Puzzle
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  imagePreview: {
    width: '100%',
    height: '70%',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  label: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButton: {
    backgroundColor: '#00A9E0',
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
  },
});