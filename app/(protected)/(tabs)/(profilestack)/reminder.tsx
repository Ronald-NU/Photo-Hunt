import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { GeneralStyle } from "@/constants/Styles";
import NotificationManager, { cancelAllNotifications, cancelNotificationByIdentifier, getAllScheduledNotifications } from "@/components/NotificationManager";
import { NotificationRequest } from "expo-notifications";
import TouchableButton from "@/components/TouchableButton";

export default function ReminderScreen() {
  const [reminders, setReminders] = useState<NotificationRequest[]>([]);
  const [refresh, setRefresh] = useState(false);

  useFocusEffect(
      useCallback(() => {
        const fetchReminders = async () => {
          const scheduled = await getAllScheduledNotifications();
          setReminders(scheduled);
          }
          fetchReminders();
      }, [refresh])
    );


  const deleteReminder = async (id: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {await cancelNotificationByIdentifier(id); setRefresh(!refresh);},
          style: "destructive",
        },
      ]
    );
 };

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <Text style={[GeneralStyle.BoldInputLabelText,{fontSize:18,paddingHorizontal:'5%',paddingBottom:10, width:'100%'}]}>Notifications</Text>
      <NotificationManager 
      title={"Puzzles Name"}
      />
      <FlatList
        style={{width:'100%'}}
        data={reminders}
        keyExtractor={(item) => item.identifier}
        renderItem={({ item }) => (
          <View style={GeneralStyle.profileSection}>
            <Text style={styles.reminderText}>{item.content.title}</Text>
            <TouchableOpacity onPress={() => deleteReminder(item.identifier)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableButton title="Delete all Notifications" onPress={async () => {
        Alert.alert(
          "Delete All Reminders",
          "Are you sure you want to delete all reminders?",
          [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
            {
              text: "OK",
              onPress: async () => {
                await cancelAllNotifications();
                setRefresh(!refresh);
              },
              style: "destructive",
            },
          ])
      }}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  reminderText: {
    fontSize: 16,
    flexShrink: 1,
  },
});