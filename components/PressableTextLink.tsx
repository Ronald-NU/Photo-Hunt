import { Text, Pressable } from 'react-native'
import React from 'react'
import { AuthStyles, GeneralStyle } from '@/constants/Styles'

type PressableTextLink = {
    onPress: () => void
    title: string
}
const PressableTextLink = ({onPress, title}:PressableTextLink) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => {
        return [pressed && GeneralStyle.Pressed]; }}>
      <Text style={AuthStyles.linkText}>{title}</Text>
    </Pressable>
  )
}

export default PressableTextLink