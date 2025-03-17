import React from 'react';
import { View, Text, Button } from 'react-native';
import { logoutUser } from '../../Firebase/firestoreHelper';
import { useRouter } from 'expo-router';

const ProtectedScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/auth/login');
  };

  return (
    <View>
      <Text>Welcome to the Protected Area!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default ProtectedScreen;