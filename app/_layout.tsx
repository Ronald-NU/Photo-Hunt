import { colors } from "@/constants/Colors";
import { GeneralStyle } from "@/constants/Styles";
import { auth } from "@/Firebase/firebaseSetup";
import { router, Stack, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Layout() {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const segments = useSegments();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
            setLoading(false);
            setUserLoggedIn(true);
          } else {
          // User is signed out
            setLoading(false);
            setUserLoggedIn(false);
          }
        })
      }, []);

      useEffect(() => {
        if (userLoggedIn && segments[0] === "(auth)")
        {
        router.replace("/(protected)/");
        }
        else if (!userLoggedIn && segments[0] === "(protected)")      
        {
        router.replace("/(auth)/login");
        }
   }, [userLoggedIn]);

   if (loading) {
    return (
      <View style={GeneralStyle.container}>
        <ActivityIndicator size="large" color={colors.Primary} />
      </View>
    );
  }
   
    return   (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen
				 name="(auth)" options={{ animation: "slide_from_left" }} />     
	<Stack.Screen 
				name="(protected)" options={{ animation: "slide_from_right" }} />
    </Stack>)
}