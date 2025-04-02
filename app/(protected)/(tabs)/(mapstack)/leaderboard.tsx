// app/(protected)/(tabs)/leaderboard.tsx
import { useRouter } from "expo-router";

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { GeneralStyle, TextStyles } from "@/constants/Styles";
import { colors } from "@/constants/Colors";

export default function LeaderboardScreen() {
  const router = useRouter();

  return (
<SafeAreaView style={styles.container}>
      {
        /*
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
      </View>
      */
      }
      
      <View style={styles.content}>
        <Text style={TextStyles.mediumText}>Leaderboard Content</Text>
      </View>
</SafeAreaView>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.White,
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});