import { UserProvider } from "@/components/UserContext";
import { auth } from "@/Firebase/firebaseSetup";
import { useRouter, Stack, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { SelectedLocationProvider } from "@/components/SelectedLocationContext";

export default function RootLayout() {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {        
            setUserLoggedIn(true);
          } else {
            setUserLoggedIn(false);
          }
          // Mark as ready after first auth state check
          setIsReady(true);
        });
        
        return () => unsubscribe();
      }, []);

      useEffect(() => {
        // Only navigate after component is mounted and ready
        if (!isReady || segments.length === 0) {
          return;
        }

        const inAuthGroup = segments[0] === "(auth)";
        const inProtectedGroup = segments[0] === "(protected)";

        if (userLoggedIn && inAuthGroup) {
          router.replace("/(protected)/");
        } else if (!userLoggedIn && inProtectedGroup) {
          router.replace("/(auth)/login");
        }
   }, [userLoggedIn, isReady, segments]);
   
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