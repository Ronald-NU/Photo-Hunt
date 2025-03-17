import { Stack } from "expo-router";

export default function Layout() {
    return   (
    <Stack screenOptions={{headerStyle: {
        backgroundColor: 'orange'
    },
    headerTitleStyle: {
        color: 'white'
    },
    headerTintColor: 'white'
    }}>
    <Stack.Screen name="login"
    options={{headerTitle:'Login'}} />
    <Stack.Screen name="signup" 
    options={{headerTitle:'Sign up'}} />
    </Stack>)
}