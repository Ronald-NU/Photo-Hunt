import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { loginUser, getUserData } from '../../Firebase/firestoreHelper';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const user = await loginUser(email, password);
      const userData = await getUserData(user.uid);
      Alert.alert("Welcome", `Hello, ${userData?.name || "User"}!`);
      router.replace('/protected/index');
    } catch (error) {
        if (error instanceof Error) {
          Alert.alert("Login Failed", error.message);
        } else {
          Alert.alert("Login Failed", "An unknown error occurred");
        }
      }
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => router.push('/auth/signup')} />
    </View>
  );
};

export default LoginScreen;