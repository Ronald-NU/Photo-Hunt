import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/Firebase/firebaseSetup';

export default function MapScreen() {
  const router = useRouter();

  const navigateToLeaderboard = () => {
    router.push("/(tabs)/leaderboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Make the leaderboard button bigger and more visible for testing */}
      <TouchableOpacity 
      style={styles.leaderboardButton} 
      onPress={() => router.push("../leaderboard")}  
    >
      <Ionicons name="trophy-outline" size={30} color="black" />
    </TouchableOpacity>

      <Text style={styles.title}>Map</Text>

      <Button title="Sign out" onPress={() => auth.signOut()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  leaderboardButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
  },
});