// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';
// import MapScreen from './index';
// import NewGameScreen from './(newGame-stack)/newGame';
// import ProfileScreen from './(profile-stack)/profile';

// const Tab = createBottomTabNavigator();

// export default function TabsLayout() {
//   return (
//     <Tab.Navigator screenOptions={{ headerShown: false }}>
//       <Tab.Screen
//         name="NewGame"
//         component={NewGameScreen}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="add-circle-outline" size={size} color={color} />
//           ),
//           title: "New Game",
//         }}
//       />
//       <Tab.Screen
//         name="Map"
//         component={MapScreen}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="map-outline" size={size} color={color} />
//           ),
//           title: "Map",
//         }}
//       />
//       <Tab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="person-outline" size={size} color={color} />
//           ),
//           title: "Profile",
//         }}
//       />
//     </Tab.Navigator>
//   );
// }
// app/(protected)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="(newGame-stack)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          title: "New Game",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
          title: "Map",
        }}
      />
      <Tabs.Screen
        name="(profile-stack)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          title: "Profile",
        }}
      />
    </Tabs>
  );
}