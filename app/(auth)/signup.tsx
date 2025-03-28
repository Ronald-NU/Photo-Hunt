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

export default function signup() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');

    const createUser = async () => {
        if (password === confirmpassword) {
            try {
                if(name =="" || email=="" || password=="" || confirmpassword==""){
                    Alert.alert("Please fill out all fields");
                    return;
                }
                if(password.length < 8){
                    Alert.alert("Make sure password is at least 8 characters");
                    return;
                }

                if(!/[A-Z]/.test(password)){
                    Alert.alert("Make sure has at least 1 capital letter");
                    return;
                }
                if(password != confirmpassword){
                    Alert.alert("Passwords do not match");
                    return;
                }
                if(!email.includes("@") || !email.includes(".")){
                    Alert.alert("Invalid Email");
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                if(user){
                    const id = await createUserDocument({
                        name: name, 
                        email: email, 
                        uid: user.uid, 
                        geoLocation: {latitude: 0, longitude: 0}
                    });
                }
            } catch (error: any) {
                if(error.code == "auth/password-does-not-meet-requirements"){
                    Alert.alert('Could not Register', 
                    "Make sure to input a valid email and password with "+ 
                    "at least 8 characters and 1 captial letter!");
                }
            }
        }
        else {
            Alert.alert('Could Not Register', 
                "Make sure the passwords match and have at least 8 characters and 1 captial letter!");
        }
    }

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