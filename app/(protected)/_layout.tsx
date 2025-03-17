import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { authStateListener } from '../../Firebase/firestoreHelper';
import { View, Text } from 'react-native';
import { User } from "firebase/auth";

export default function ProtectedLayout() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authStateListener(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login'); 
    }
  }, [user]);

  if (!user) {
    return (
      <View>
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return <Stack />;
}