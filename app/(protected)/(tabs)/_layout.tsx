import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

// Screens
import MapScreen from './index';
import NewGameScreen from './(newGame-stack)/newGame';
import ProfileScreen from './(profile-stack)/profile';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="NewGameTab"
        component={NewGameScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          title: "New Game",
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          title: "Map",
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}