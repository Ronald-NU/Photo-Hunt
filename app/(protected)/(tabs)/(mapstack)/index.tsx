// import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
// import React from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { auth } from '@/Firebase/firebaseSetup';

// export default function MapScreen() {
//   const router = useRouter();

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Leaderboard button */}
//       <TouchableOpacity style={styles.leaderboardButton} onPress={() => router.push("/(protected)/(tabs)/leaderboard")}>
//         <Ionicons name="trophy-outline" size={30} color="black" />
//       </TouchableOpacity>


//       <Text style={styles.title}>Map</Text>

//       <Button title="Sign out" onPress={() => auth.signOut()} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'white',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#6200ea',
//   },
//   leaderboardButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20, 
//     padding: 10,
//   },
// });
// app/(protected)/(tabs)/index.tsx
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/Firebase/firebaseSetup';

export default function MapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< HEAD:app/(protected)/(tabs)/(mapstack)/index.tsx
      {/* Leaderboard button */}
      <TouchableOpacity style={styles.leaderboardButton} onPress={() => router.push('leaderboard')}>
=======
      {/* Leaderboard button - Fix the path */}
      <TouchableOpacity 
        style={styles.leaderboardButton} 
        onPress={() => router.push("/leaderboard")}
      >
>>>>>>> 383b733 (Refactor tab navigation and screens):app/(protected)/(tabs)/index.tsx
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
  },
});