import { Text, View, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import PressableTextLink from '@/components/PressableTextLink';
import { AuthStyles, GeneralStyle } from '@/constants/Styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/Firebase/firebaseSetup';
import { colors } from '@/constants/Colors';
import TouchableButton from '@/components/TouchableButton';

export default function forgot() {
    const [email, setEmail] = useState('');
    const [madeRequest, setMadeRequest] = useState(false);

    const forgotPasswordRequest = async () => {
            try {
                if(email==""){
                    Alert.alert("Please fill out all fields");
                    return;
                }
                if(!email.includes("@") || !email.includes(".")){
                    Alert.alert("Invalid Email");
                    return;
                }
                setMadeRequest(true);
                sendPasswordResetEmail(auth, email);
            } catch (error) {

            }
    }

    return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={[GeneralStyle.container, {backgroundColor: colors.Primary}]}>
         <Text style={AuthStyles.TitleText}>Forgot Your Password?</Text>
        <View style={AuthStyles.ViewBox}>
        { !madeRequest && <>
        <Text style={[GeneralStyle.BoldInputLabelText,{ width:'80%', textAlign:'left'}]}>Email</Text>
        <TextInput 
        placeholder='Email Address' 
        style={GeneralStyle.textInput}
        value={email}
        keyboardType='email-address'
        onChangeText={text => {setEmail(text)}}/>
        <TouchableButton onPress={forgotPasswordRequest} title="Forgot Password" widthBut={'80%'}  />
           </>
        }
        { madeRequest && 
            <>
            <Text style={[GeneralStyle.BoldInputLabelText, {textAlign:'center'}]}>Request Sent!</Text>
            <Text style={[GeneralStyle.BoldInputLabelText, {textAlign:'center', fontSize:12, margin:8}]}>Check your email for a the reset link!</Text>
            </>
        }
        <PressableTextLink onPress={() => router.replace('./login')} title="Remeber your password? Login"/>
        </View>
       </SafeAreaView>
       </TouchableWithoutFeedback>
    )
}