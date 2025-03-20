import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { router } from 'expo-router'
import { GeneralStyle, TextStyles } from '@/constants/Styles'

type BackHeaderProps = {
    title:string;
}
const BackHeader = ({title}:BackHeaderProps) => {
  return (
    <View style={GeneralStyle.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={[TextStyles.LargeText, {fontWeight:'bold', textAlign:'center'}]}>{title}</Text>
      </View>
  )
}

export default BackHeader