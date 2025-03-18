import { Text, View, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/Firebase/firebaseSetup';
import { FirebaseError } from 'firebase/app';
import PressableAuthButton from '@/components/PressableAuthButton';
import PressableTextLink from '@/components/PressableTextLink';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStyles, GeneralStyle } from '@/constants/Styles';

export default function login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const loginUser = async () => {
        try {
            if(email === '' || password === ''){
                Alert.alert('Could not Login',
                 "Make sure to input a valid email and password!");
                return;
            } 
            if(password.length < 8){
                Alert.alert('Could not Login',
                 "Password incorrect!");
                return;
            }
            if(!email.includes('@')){
                Alert.alert('Could not Login',
                 "Email incorrect!");
                return;
            }
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if(error instanceof FirebaseError && "code" in error && "message" in error){
                if(error.code === 'auth/user-not-found'){
                    Alert.alert('Could not Login',
                 "User not found!");
                 return;
                }
                if(error.code === 'auth/wrong-password'){
                    Alert.alert('Could not Login',
                 "Password incorrect!");  
                 return;
                }
            }
            Alert.alert('Could not Login',
                 "Make sure to input a valid email and password!");           
            console.log(error);
        }
    }
    
    return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={GeneralStyle.container}>
        <Text style={GeneralStyle.TitleText}>Photo Hunt</Text>
    <View style={AuthStyles.ViewBox}>
        <Text style={GeneralStyle.BoldInputLabelText}>Email Address</Text>
        <TextInput 
        placeholder='Enter Email Address' 
        style={GeneralStyle.textInput}
        value={email}
        keyboardType='email-address'
        onChangeText={text => {setEmail(text)}}/>
        <Text style={GeneralStyle.BoldInputLabelText}>Password</Text>
        <TextInput 
        placeholder='Enter Password' 
        style={GeneralStyle.textInput}
        secureTextEntry={true}
        value={password}
        onChangeText={text => {setPassword(text)}}/>
        <PressableAuthButton onPress={loginUser} title="Log in"/>
        <PressableTextLink onPress={() => router.replace('./signup')} title="New User? Create an account"/>
        <PressableTextLink onPress={() => router.replace('./forgot')} title="Forgot Password?"/>
        </View>
        </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}