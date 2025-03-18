import { View, Text, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth } from '@/Firebase/firebaseSetup'

export default function App() {
 
  return (
    <SafeAreaView>
      <Text>Map</Text>
      <Button title="Sign out" onPress={() => auth.signOut()} />
    </SafeAreaView>
  )
}