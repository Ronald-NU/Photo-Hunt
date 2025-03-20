import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/Firebase/firebaseSetup';
import { GeneralStyle } from '@/constants/Styles';

export default function MapScreen() {
  const router = useRouter();

  const navigateToLeaderboard = () => {
    router.push("leaderboard");
  };

  return (
    <SafeAreaView style={GeneralStyle.container}>
      {/* Make the leaderboard button bigger and more visible for testing */}
      <TouchableOpacity 
      style={styles.leaderboardButton} 
      onPress={() => navigateToLeaderboard()}  
    >
      <Ionicons name="trophy-outline" size={30} color="black" />
    </TouchableOpacity>

      <Text style={GeneralStyle.title}>Map</Text>
    </SafeAreaView>
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
});