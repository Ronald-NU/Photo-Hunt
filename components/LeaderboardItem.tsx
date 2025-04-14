import { colors } from "@/constants/Colors"
import { GeneralStyle, TextStyles } from "@/constants/Styles"
import React from "react"
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from "react-native"
import { PlayData, UserData } from "@/Firebase/DataStructures";

type leaderboardItemProps = {
    item: PlayData|UserData;
    index: number;
}
export const LeaderboardItem = ({item, index}:leaderboardItemProps) => {
    return (<View style={GeneralStyle.profileSection}>
            {
              index === 0 ? (
                <Ionicons name="trophy" size={24} color={colors.Gold} />
              ) : index === 1 ? (
                <Ionicons name="trophy" size={24} color={colors.Silver} />
              ) : index === 2 ? (
                <Ionicons name="trophy" size={24} color={colors.Bronze} />
              ) : (
                <Text style={[TextStyles.LargeText,{textAlign:'center'}]}> {index + 1}</Text>
              )
            }
        <View style={{flexDirection: 'row', justifyContent:'space-between', width:'80%'}}>
          <Text style={TextStyles.LargeText}>{item.name}</Text>
          <Text style={TextStyles.mediumText}>{item.score}</Text>
        </View>
        </View>
    )
}