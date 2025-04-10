import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle } from "@/constants/Styles";
import { colors } from '@/constants/Colors';

export default function ProfilePuzzleScreen() {
  const router = useRouter();
  const { imageUri, difficulty, locationName } = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };
  const objectPath = encodeURIComponent((imageUri as string).split('/o/')[1].split('?')[0]);
  const imageURI = (imageUri as string).split('/o/')[0] + '/o/' + objectPath + '?alt=media&token=' + (imageUri as string).split('token=')[1];
  console.log(imageURI as string);
  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={()=>handleBack()} onPressIn={() => handleBack()}>
              <Text style={styles.headerButton}>Back</Text>
            </TouchableOpacity>
          ),
          title: locationName as string,
          headerTitle: () => (
            <View style={styles.headerCenter}>
              <Text style={styles.title}>{locationName as string}</Text>
              <Text style={styles.difficulty}>Difficulty: {difficulty}</Text>
            </View>
          )
        }}
      />

      <View style={styles.puzzleContainer}>
        <Image
          style={{
            width: Dimensions.get('window').width - 40,
            height: Dimensions.get('window').width - 40,
            resizeMode: 'contain'
          }}
          source={{ uri: imageURI as string }}
          />
          </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    color: '#007AFF',
    fontSize: 17,
    padding: 10,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  difficulty: {
    fontSize: 14,
    color: colors.Grey,
  },
  puzzleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }
}); 