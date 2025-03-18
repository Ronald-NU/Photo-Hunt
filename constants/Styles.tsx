import { StyleSheet } from "react-native";
import { colors } from "./Colors";

export const AuthStyles = StyleSheet.create({
    linkText: {
        color: colors.Primary,
        textDecorationLine: 'underline',
        fontSize: 14,
        marginTop: 4,
        textAlign:'center'
    },
    ViewBox: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.White,
        paddingVertical: 25,
        borderRadius: 10,
        shadowColor: colors.Black,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    PressableBox: {
        width:'100%',
        alignItems:'center',
        margin:4
    },
    AuthViewButtonBox:{
        width:'80%',
        backgroundColor: colors.Primary, 
        height:40,
        justifyContent: 'center',
        padding: 8, 
        borderRadius: 8, 
        alignItems: 'center',
    },
    AuthTextButton:{
        color: colors.White, 
        fontSize:16, 
        fontWeight:'600'
    }
})

export const GeneralStyle = StyleSheet.create({
        Pressed: {
            opacity: 0.5
        },
        TitleText: {
            fontSize: 48,
            textAlign:'center',
            color: colors.White,
            fontWeight: 'bold',  
            shadowColor: colors.Black,
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            position: 'absolute',
            top: '15%'
        },
        textInput:{
            fontSize:18,
            color: colors.Black, 
            marginTop:4,
            marginBottom:8, 
            height:40,
            borderWidth: 1, 
            borderRadius: 8, 
            width: '80%', 
            textAlign: 'center'},
        container: {
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.Primary
          },
          BoldInputLabelText:{
            fontSize:18, 
            fontWeight:600,
            width:'80%', 
            textAlign:'left'},
    });