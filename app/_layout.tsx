import { UserProvider } from "@/components/UserContext";
import { useRouter, Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SelectedLocationProvider } from "@/components/SelectedLocationContext";

export default function RootLayout() {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        let timer: NodeJS.Timeout;
        
        // Delay Firebase initialization to ensure React Native is fully initialized
        const initAuth = async () => {
          try {
            // Dynamic import to delay Firebase initialization
            const { auth } = await import("@/Firebase/firebaseSetup");
            const { onAuthStateChanged } = await import("firebase/auth");
            
            unsubscribe = onAuthStateChanged(auth, (user) => {
              if (user) {        
                setUserLoggedIn(true);
              } else {
                setUserLoggedIn(false);
              }
              // Mark as ready after first auth state check
              setIsReady(true);
            });
          } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsReady(true); // Set ready even on error to prevent blocking
          }
        };
        
        // Add a small delay to ensure React Native runtime is ready
        timer = setTimeout(() => {
          initAuth();
        }, 100);
        
        return () => {
          clearTimeout(timer);
          if (unsubscribe) {
            unsubscribe();
          }
        };
      }, []);

      useEffect(() => {
        // Only navigate after component is mounted and ready
        if (!isReady || segments.length < 1) {
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