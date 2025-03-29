import { UserProvider, useUser } from "@/components/UserContext";
import { auth } from "@/Firebase/firebaseSetup";
import { router, Stack, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { SelectedLocationProvider } from "@/components/SelectedLocationContext";

export default function RootLayout() {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const segments = useSegments();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {        
            setUserLoggedIn(true);
          } else {
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
   
    return   (
    <UserProvider>
      <SelectedLocationProvider>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen
					 name="(auth)" options={{ animation: "slide_from_left" }} />     
			<Stack.Screen 
				 name="(protected)" options={{ animation: "slide_from_right" }} />
        </Stack>
      </SelectedLocationProvider>
    </UserProvider>)
}