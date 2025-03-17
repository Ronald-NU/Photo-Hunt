import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ViewSearchFriendScreen from '../protected/ViewSearchFriendScreen';
import MyPuzzlesScreen from '../protected/MyPuzzlesScreen';
import RemindersScreen from '../protected/RemindersScreen';
import FriendPuzzlesScreen from '../protected/FriendPuzzlesScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="Home" 
        component={BottomTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="ViewSearchFriend" 
        component={ViewSearchFriendScreen} 
        options={{ title: "View & Search Friend", headerBackTitle: "Back" }} 
      />
      <Stack.Screen 
        name="MyPuzzles" 
        component={MyPuzzlesScreen} 
        options={{ title: "My Puzzles", headerBackTitle: "Back" }} 
      />
      <Stack.Screen 
        name="Reminders" 
        component={RemindersScreen} 
        options={{ title: "Reminders", headerBackTitle: "Back" }} 
      />
      <Stack.Screen 
        name="FriendPuzzles" 
        component={FriendPuzzlesScreen} 
        options={{ title: "Friend Puzzles", headerBackTitle: "Back" }} 
      />
    </Stack.Navigator>
  );
}