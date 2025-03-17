import { Text, StyleSheet, View, TextInput, Button, Alert } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/Firebase/firebaseSetup';
import { FirebaseError } from 'firebase/app';

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
    <View style={styles.container}>
        <Text style={styles.text}>Email Address</Text>
        <TextInput 
        placeholder='Enter Email Address' 
        style={styles.textInput} 
        value={email}
        keyboardType='email-address'
        onChangeText={text => {setEmail(text)}}/>
        <Text style={styles.text}>Password</Text>
        <TextInput 
        placeholder='Enter Password' 
        style={styles.textInput}
        secureTextEntry={true}
        value={password}
        onChangeText={text => {setPassword(text)}}/>
        <Button title="Log in" onPress={()=>{loginUser()}}/>
        <Button title="New User? Create an account" onPress={() => router.replace('./signup')}/>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textInput:{fontSize:20,color:'orange', margin:10, height:40,
      borderWidth: 1, borderRadius: 8, width: '80%', textAlign: 'center'},
      buttonContainer:{flexDirection:'row', justifyContent:'space-between'},
    text:{fontSize:16, margin:2, width:'80%', textAlign:'left'},
});