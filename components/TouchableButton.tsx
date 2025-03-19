import { GeneralStyle } from '@/constants/Styles'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type TouchableButtonProps = {
    onPress: () => void
    title: string
}
const TouchableButton = ({onPress,  title}:TouchableButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={GeneralStyle.button}>
            <Text style={GeneralStyle.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

export default TouchableButton