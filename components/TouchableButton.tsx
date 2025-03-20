import { GeneralStyle } from '@/constants/Styles'
import React from 'react'
import { DimensionValue, Text, TouchableOpacity } from 'react-native'

type TouchableButtonProps = {
    onPress: () => void
    title: string
    widthBut?: DimensionValue
    colors?:string
}
const TouchableButton = ({onPress,  title, widthBut, colors}:TouchableButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[GeneralStyle.button,
    widthBut?{width:widthBut, justifyContent:'center'}:null,
    colors?{backgroundColor:colors}:null]}>
            <Text style={GeneralStyle.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

export default TouchableButton