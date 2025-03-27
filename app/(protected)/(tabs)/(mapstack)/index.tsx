import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GeneralStyle } from '@/constants/Styles';
import LocationManager from '@/components/LocationManager';

export default function MapScreen() {
  const router = useRouter();

  const navigateToLeaderboard = () => {
    router.push("leaderboard");
  };

  return (
    <View style={GeneralStyle.container}>
      <LocationManager />
      {/* Make the leaderboard button bigger and more visible for testing */}
      <TouchableOpacity 
      style={styles.leaderboardButton} 
      onPress={() => navigateToLeaderboard()}  
    >
      <Ionicons name="trophy-outline" size={30} color="black" />
    </TouchableOpacity>
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
});