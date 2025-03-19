<<<<<<< HEAD
import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
    return   (
    <Stack screenOptions={{ headerShown: false}}>
         <Stack.Screen name="(tabs)"  />
    </Stack>
)
=======
// import { PressableButton } from "@/components/PressableButton";
// import { router, Stack } from "expo-router";
// import React from "react";

// export default function Layout() {
//     return   (
//     <Stack screenOptions={{ headerShown: false}}/>
// )
// }

import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
    </Stack>
  );
>>>>>>> 143d33b (Refactor leaderboard screen)
}