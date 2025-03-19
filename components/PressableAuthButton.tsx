import { Text, Pressable, View } from 'react-native'
import React from 'react'
import { AuthStyles, GeneralStyle } from '@/constants/Styles'

type PressableAuthButtonProps = {
    onPress: () => void
    title: string
}
const PressableAuthButton = ({onPress,  title}:PressableAuthButtonProps) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => {
      return [AuthStyles.PressableBox,pressed && GeneralStyle.Pressed]; }}>
        <View style={AuthStyles.AuthViewButtonBox}>
      <Text style={AuthStyles.AuthTextButton}>{title}</Text>
      </View>
    </Pressable>
  )
}

export default PressableAuthButton