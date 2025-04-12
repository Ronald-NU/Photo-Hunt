// app/(protected)/(tabs)/(mapstack)/validateCamera.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { colors } from '@/constants/Colors';
import { compareImages } from '@/utils/imageComparison';
import { updatePlayDataDocument } from '@/Firebase/firebaseHelperPlayData';
import { auth } from '@/Firebase/firebaseSetup';
import { Ionicons } from '@expo/vector-icons';
import { PlayData } from '@/Firebase/DataStructures';
import { createPlayDocument } from '@/Firebase/firebaseHelperPlayData';

export default function ValidatePuzzleScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { puzzleId, playId, moves, originalImageUri, locationName, difficulty } = params;
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    Alert.alert(
      "Leave Verification?",
      "Are you sure you want to leave without verifying your puzzle completion?",
      [
        {
          text: "Stay",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => router.push('/(protected)/(tabs)/(mapstack)/map')
        }
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      setLoading(true);
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Insufficient permissions!',
          'You need to grant camera permissions to use this app.',
          [{ text: 'Okay' }]
        );
        return;
      }

      // Take photo using ImagePicker
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
        allowsEditing: false,
      });

      if (result.canceled) {
        return;
      }

      const photo = result.assets[0];
      if (!photo.uri) {
        throw new Error('Failed to capture photo');
      }

      // Compare images
      const comparisonResult = await compareImages(originalImageUri as string, photo.uri);
      
      if (comparisonResult.isSimilar) {
        try {
          // Update verification results
          const updatedData: Partial<PlayData> = {
            isPhotoVerified: true,
            verificationTimestamp: Date.now(),
            imageSimilarity: comparisonResult.similarity,
            score: parseInt(moves as string),
            isCompleted: true
          };

          // Try to update document
          const updateResult = await updatePlayDataDocument(playId as string, updatedData as PlayData);
          
          if (updateResult === true) {
            // Show success message
            Alert.alert(
              'Verification Success',
              'Congratulations! You have completed this puzzle!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    router.push({
                      pathname: "/(protected)/(tabs)/(mapstack)/markerScreen",
                      params: {
                        puzzleId: puzzleId,
                        puzzleName: locationName,
                        creatorId: auth.currentUser?.uid,
                        difficulty: difficulty,
                        imageUri: originalImageUri
                      }
                    });
                  },
                },
              ]
            );
          } else {
            // If update fails, try to create new document
            if (auth.currentUser && puzzleId) {
              const newPlayData: PlayData = {
                puzzleID: puzzleId as string,
                playerID: auth.currentUser.uid,
                name: auth.currentUser.displayName || 'Anonymous',
                score: parseInt(moves as string),
                isCompleted: true,
                isPhotoVerified: true,
                verificationTimestamp: Date.now(),
                imageSimilarity: comparisonResult.similarity
              };
              
              const newPlayId = await createPlayDocument(newPlayData);
              if (typeof newPlayId === 'string') {
                Alert.alert(
                  'Verification Success',
                  'Congratulations! You have completed this puzzle!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        router.push({
                          pathname: "/(protected)/(tabs)/(mapstack)/markerScreen",
                          params: {
                            puzzleId: puzzleId,
                            puzzleName: locationName,
                            creatorId: auth.currentUser?.uid,
                            difficulty: difficulty,
                            imageUri: originalImageUri
                          }
                        });
                      },
                    },
                  ]
                );
              } else {
                throw new Error('Failed to create new play document');
              }
            }
          }
        } catch (error) {
          console.error('Error updating play data:', error);
          Alert.alert(
            'Error',
            'Failed to save verification results. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Verification Failed',
          comparisonResult.reason || 'Please ensure the photo matches the target image',
          [{ text: 'Retry' }]
        );
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Error',
        'An error occurred while taking the photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.headerButton}>Cancel</Text>
            </TouchableOpacity>
          ),
          title: "Verify Completion",
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Verify Completion</Text>
              <Text style={styles.subtitle}>{locationName}</Text>
            </View>
          )
        }}
      />
      
      <View style={styles.container}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={colors.Primary} />
            <Text style={styles.processingText}>Verifying completion...</Text>
          </View>
        ) : (
          <View style={styles.overlayContainer}>
            <Text style={styles.instructionText}>
              Take a photo of the completed puzzle to verify
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={handleTakePhoto}
                disabled={isProcessing || loading}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.Black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    color: colors.Primary,
    fontSize: 17,
    padding: 10,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.Black,
  },
  subtitle: {
    fontSize: 14,
    color: colors.Grey,
  },
  overlayContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: colors.White,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: colors.White,
    fontSize: 16,
    marginTop: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.White,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.White,
    borderWidth: 2,
    borderColor: colors.Black,
  },
});