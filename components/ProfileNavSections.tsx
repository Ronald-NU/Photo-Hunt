import { Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { GeneralStyle } from '@/constants/Styles'

type ProfileNavProps = {
    onPress: () => void
    title: string
}
const ProfileNavSections = ({onPress, title}:ProfileNavProps) => {
  return (
    <TouchableOpacity style={GeneralStyle.profileSection} onPress={onPress}>
          <Text style={GeneralStyle.profileSectionText}>{title}</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
    </TouchableOpacity>
  )
}

export default ProfileNavSections