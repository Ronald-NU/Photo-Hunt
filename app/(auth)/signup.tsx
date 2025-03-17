import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { registerUser, addUserData } from '../../Firebase/firestoreHelper';
import { useRouter } from 'expo-router';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const user = await registerUser(email, password);
      await addUserData(user.uid, name);
      Alert.alert("Success", "Account created successfully!");
      router.replace('/protected/index');
    } catch (error) {
        if (error instanceof Error) {
          Alert.alert("Signup Failed", error.message);
        } else {
          Alert.alert("Signup Failed", "An unknown error occurred");
        }
      }
  };

  return (
    <View>
      <Text>Sign Up</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button title="Back to Login" onPress={() => router.push('/auth/login')} />
    </View>
  );
};

export default SignupScreen;