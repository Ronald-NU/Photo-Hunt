import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { GeneralStyle } from '@/constants/Styles'

type PressableTextLink = {
    onPress: () => void
    title: string
}
const PressableTextLink = ({onPress, title}:PressableTextLink) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={GeneralStyle.linkText}>{title}</Text>
    </TouchableOpacity>
  )
}

export default PressableTextLink