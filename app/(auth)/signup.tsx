import { Text, View, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '@/Firebase/firebaseSetup';
import { FirebaseError } from 'firebase/app';
import PressableTextLink from '@/components/PressableTextLink';
import { AuthStyles, GeneralStyle } from '@/constants/Styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserDocument } from '@/Firebase/firebaseHelperUsers';
import { colors } from '@/constants/Colors';
import TouchableButton from '@/components/TouchableButton';
import * as Location from 'expo-location';
import { UserCreateData } from '@/Firebase/DataStructures';

export default function signup() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');

    const createUser = async () => {
        try {
            if(email === '' || password === '' || name === ''){
                Alert.alert('Could not Register',
                 "Make sure to input a valid email and password!");
                return;
            } 
            if(password.length < 8){
                Alert.alert('Could not Register',
                 "Password must be at least 8 characters long!");
                return;
            }
            if(!email.includes('@')){
                Alert.alert('Could not Register',
                 "Please enter a valid email address!");
                return;
            }
            if(password !== confirmpassword){
                Alert.alert('Could not Register',
                 "Passwords do not match!");
                return;
            }

            // Create Firebase auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Get current location for initial user data
            let location = await Location.getCurrentPositionAsync({});
            
            // Create user document in Firestore
            const userData: UserCreateData = {
                name: name,
                email: email,
                uid: userCredential.user.uid,
                geoLocation: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }
            };
            
            await createUserDocument(userData);
            
            // Navigate to protected area
            router.replace("/(protected)/");
        } catch (error) {
            if(error instanceof FirebaseError && "code" in error && "message" in error){
                if(error.code === 'auth/email-already-in-use'){
                    Alert.alert('Could not Register',
                 "Email already in use!");
                 return;
                }
                if(error.code === 'auth/invalid-email'){
                    Alert.alert('Could not Register',
                 "Invalid email address!");
                 return;
                }
                if(error.code === 'auth/operation-not-allowed'){
                    Alert.alert('Could not Register',
                 "Email/password accounts are not enabled!");
                 return;
                }
                if(error.code === 'auth/weak-password'){
                    Alert.alert('Could not Register',
                 "Password is too weak!");
                 return;
                }
            }
            console.error('Error creating user:', error);
            Alert.alert('Could not Register',
                 "An error occurred during registration. Please try again.");
        }
    };

    const anonymousSignIn =  async () => {
       signInAnonymously(auth);
    }
    
    return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={[GeneralStyle.container, {backgroundColor: colors.Primary}]}>
         <Text style={AuthStyles.TitleText}>Register</Text>
         <View style={[AuthStyles.ViewBox, { top: 45 }]}>
        <Text style={[GeneralStyle.BoldInputLabelText,{ width:'80%', textAlign:'left'}]}>Name</Text>
        <TextInput 
        placeholder='Name' 
        style={GeneralStyle.textInput}
        value={name}
        onChangeText={text => {setName(text)}}/>
        <Text style={[GeneralStyle.BoldInputLabelText,{ width:'80%', textAlign:'left'}]}>Email Address</Text>
        <TextInput 
        placeholder='Email Address' 
        style={GeneralStyle.textInput}
        value={email}
        keyboardType='email-address'
        onChangeText={text => {setEmail(text)}}/>
        <Text style={[GeneralStyle.BoldInputLabelText,{ width:'80%', textAlign:'left'}]}>Password</Text>
        <TextInput 
        placeholder='Password' 
        style={GeneralStyle.textInput}
        secureTextEntry={true}
        value={password}
        onChangeText={text => {setPassword(text)}}/>
         <Text style={[GeneralStyle.BoldInputLabelText,{ width:'80%', textAlign:'left'}]}>Confirm Password</Text>
         <TextInput 
        placeholder='Password' 
        style={GeneralStyle.textInput}
        secureTextEntry={true}
        value={confirmpassword}
        onChangeText={text => {setConfirmPassword(text)}}/>
        <TouchableButton onPress={createUser} title="Register" widthBut={'80%'} />
        <PressableTextLink onPress={anonymousSignIn} title="Don't want to make an account? Sign in Anonymously with limited features"/>
        <PressableTextLink onPress={() => router.replace('./login')} title="Already Registered? Login"/>
        </View>
       </SafeAreaView>
       </TouchableWithoutFeedback>
    )
}