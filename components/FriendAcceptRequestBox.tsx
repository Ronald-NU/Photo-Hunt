import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { GeneralStyle, TextStyles } from '@/constants/Styles'

type ProfileNavProps = {
    onPressAccept: () => void
    onPressCancel: () => void
    pendingFriend:boolean;
    title: string
}
const FriendAcceptRequestBox = ({onPressAccept, onPressCancel, pendingFriend, title}:ProfileNavProps) => {
  return (
    <View style={[GeneralStyle.profileSection,{justifyContent:'flex-start',paddingVertical:11}]}>
          <Text style={[{fontWeight:'bold',marginRight:'auto'},TextStyles.LargeText]}>{title}</Text>
          {pendingFriend?<TouchableOpacity style={{marginRight:8}} onPress={onPressAccept}>
          <Ionicons name='checkmark-circle-outline' size={30} color="green" />
          </TouchableOpacity>:null}
          <TouchableOpacity style={{marginLeft:8}} onPress={onPressCancel}>
          <Ionicons name='close-circle-outline' size={30} color="red" />
          </TouchableOpacity>
    </View>
  )
}

export default FriendAcceptRequestBox;