import React from 'react';
import { View, Text, StyleSheet, Image, Button, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle, TextStyles } from "@/constants/Styles";
import { validateImage } from '@/utils/imageValidation';
import * as FileSystem from 'expo-file-system';
import { colors } from '@/constants/Colors';
import { createPuzzleDocument } from '@/Firebase/firebaseHelperPuzzles';
import { getAuth } from 'firebase/auth';
import { PuzzleData } from '@/Firebase/DataStructures';
import { getUserData, updateUserDocument } from '@/Firebase/firebaseHelperUsers';
import NetInfo from '@react-native-community/netinfo';
import { storeImage } from '@/Firebase/firestoreHelper';

// Helper function to generate unique ID
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

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
      
      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        exif: false,
      });
      
      console.log('Camera result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const originalUri = result.assets[0].uri;
        console.log('Original image URI:', originalUri);

        // Generate a unique filename
        const fileName = `photo_${Date.now()}.jpg`;
        const newUri = `${FileSystem.cacheDirectory}${fileName}`;

        await FileSystem.copyAsync({
          from: originalUri,
          to: newUri
        });

        console.log('New image URI:', newUri);
        
        const fileInfo = await FileSystem.getInfoAsync(newUri);
        console.log('New image exists check:', fileInfo);
        
        const validation = await validateImage(newUri);
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
        
        setImageUri(newUri);
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

  const checkNetworkConnection = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Network check error:', error);
      return false;
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      // First, get the image info
      const imageInfo = await FileSystem.getInfoAsync(uri);
      if (!imageInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // If the image is already small enough, return the original
      if (imageInfo.size && imageInfo.size < 500 * 1024) { // 500KB
        return uri;
      }

      // Create a compressed version
      const compressedUri = `${FileSystem.cacheDirectory}compressed_${Date.now()}.jpg`;
      
      // Use ImageManipulator to compress the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3, // More aggressive compression
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('Image compression failed');
      }

      // Copy the compressed image to our cache directory
      await FileSystem.copyAsync({
        from: result.assets[0].uri,
        to: compressedUri
      });

      return compressedUri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const uploadImageToFirebase = async (uri: string): Promise<string> => {
    try {
      // Check network connection first
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error("No network connection");
      }

      console.log('Starting image upload process...');
      console.log('File path:', uri);

      // Use the storeImage function from firestoreHelper
      const photoURL = await storeImage(uri);
      console.log('Image uploaded successfully:', photoURL);

      return photoURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  };

  const createPuzzleInBackground = async () => {
    if (!location) {
      Alert.alert("Error", "Location data is not available. Please try again.");
      return;
    }

    // Check network connection first
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated. Please sign in again.");
      }

      // Upload image to Firebase Storage
      let photoURL;
      try {
        console.log('Uploading image to Firebase Storage...');
        photoURL = await uploadImageToFirebase(imageUri);
        console.log('Image uploaded successfully:', photoURL);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert(
          "Error",
          "Failed to upload image. Please try again.",
          [{ text: "OK" }]
        );
        return;
      }

      const puzzleId = generateUniqueId();
      const puzzleData: PuzzleData = {
        id: puzzleId,
        creatorID: user.uid,
        name: locationName as string,
        geoLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        photoURL: photoURL,
        difficulty: parseInt(difficulty as string)
      };

      // Create puzzle document
      try {
        const createdPuzzleId = await createPuzzleDocument(user.uid, puzzleData);
        if (!createdPuzzleId) {
          throw new Error("Failed to create puzzle document in database");
        }

        // Get current user data
        const userData = await getUserData(user.uid);
        const currentPuzzles = userData?.mypuzzles || [];

        // Add new puzzle to the array
        const updatedPuzzles = [...currentPuzzles, {
          id: puzzleId,
          name: locationName as string,
          difficulty: parseInt(difficulty as string)
        }];

        // Update user's mypuzzles array with the combined list
        await updateUserDocument(user.uid, {
          mypuzzles: updatedPuzzles
        });

        Alert.alert("Success", "Puzzle created successfully!");
        router.back();
      } catch (dbError: unknown) {
        console.error('Database operation failed:', dbError);
        const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
        Alert.alert(
          "Database Error",
          `Failed to save puzzle: ${errorMessage}`,
          [{ text: "OK" }]
        );
      }
    } catch (error: unknown) {
      console.error('Error creating puzzle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        "Error",
        `Failed to create puzzle: ${errorMessage}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
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
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: imageUri }} 
                style={{ width: 300, height: 300, backgroundColor: 'black' }}
                resizeMode="cover"
                onError={(error) => {
                  console.error('Image loading error:', error.nativeEvent.error);
                  Alert.alert('Error', 'Failed to load image');
                }}
                onLoad={(event) => {
                  console.log('Image loaded successfully with size:', {
                    width: event.nativeEvent.source.width,
                    height: event.nativeEvent.source.height
                  });
                }}
              />
            </View>
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
              onPress={createPuzzleInBackground}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Save Puzzle
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.White,
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
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: colors.Grey,
    fontSize: 16,
  },
  label: {
    color: colors.Grey,
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
  },
  primaryButton: {
    backgroundColor: '#00A9E0',
  },
  buttonText: {
    textAlign: 'center',
    color: colors.Grey,
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: colors.White,
  },
});