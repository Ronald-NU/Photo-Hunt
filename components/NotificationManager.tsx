import { GeneralStyle, TextStyles } from "@/constants/Styles";
import * as Notifications from "expo-notifications";
import React, { useState } from "react";
import { Alert, Button, Modal, View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import TouchableButton from "./TouchableButton";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/Colors";

export  const verifyPermissions = async () => {
    const settings = await Notifications.getPermissionsAsync();
    if(settings.granted)
    {
      return settings.granted;
    } else {
        const status = await Notifications.requestPermissionsAsync();
        return status.granted;
    }
  }
type NotificationType = {
    title: string;
}
export const NotificationManager = ({title}:NotificationType) => {

    const [visible, setVisible] = useState(false);
    const [time, setTime] = useState<Date>(new Date());
    const [timeVal, setTimeVal] = useState<string>(`${new Date().getHours()}:${new Date().getMinutes()}`);

return (
    <View style={{justifyContent:'center', alignItems:'center'}}>
        <Modal visible={visible} animationType='slide' transparent={true}>
            <View style={GeneralStyle.overlay}>
                    <View style={GeneralStyle.modalContainer}>
            <Text style={[GeneralStyle.title,{color:colors.Black}]}>{title}</Text>
            <Text style={[TextStyles.mediumText, {color:colors.Black, textAlign:'center', paddingVertical:16}]}>
                Schedule a daily notification for {title} at the time below to continue your Photo Hunt!
            </Text>
            <DateTimePicker
                mode="time"
                value={time}
                onChange={(event: any, selectedDate: Date | undefined) => {
                    if (selectedDate) {
                        setTime(selectedDate);
                        setTimeVal(`${selectedDate.getHours()}:${selectedDate.getMinutes()}`);
                    }
                }}
            />
            <View style={{flexDirection:'row',justifyContent:'space-between', width:'90%'}}>
            <Button title='Schedule Notification' onPress={() => {
                scheduleNotificationHandler(title, timeVal);
                setVisible(false)}}/>
            <Button title='Cancel' onPress={() => {setVisible(false)}}/>
            </View>
                </View>
            </View>
        </Modal>
     {
        <TouchableOpacity onPress={() => setVisible(true)}>
          <Ionicons name="notifications-outline" size={24} color="gold"/>
        </TouchableOpacity>
     } 
    </View>
  )
}

export const scheduleNotificationHandler = async (title:string, time:string) => {
    try {
      if(await verifyPermissions()){
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: `Come back to your ${title} Photo Hunt!`,
        },
        trigger: {type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: parseInt(time.split(':')[0]), minute: parseInt(time.split(':')[1])},
      });
      } else {
        Alert.alert("Need Permissions", "To use Notifications go to Settings and allow Notifications!")
      }
    }
    catch (err) {
      console.log(err)
    }
  };

  export async function getAllScheduledNotifications() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', scheduled);
    return scheduled;
  }

  export async function cancelAllNotifications() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    console.log('All notifications cancelled');
  }

  export async function cancelNotificationByIdentifier(identifier: string) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const notification = scheduled.find((n) => n.identifier === identifier);
    if (notification) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`Notification with identifier ${identifier} cancelled`);
    } else {
      console.log(`Notification with identifier ${identifier} not found`);
    }
  }

export default NotificationManager;