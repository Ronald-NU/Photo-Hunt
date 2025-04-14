import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { GeneralStyle } from "@/constants/Styles";
import { cancelAllNotifications, cancelNotificationByIdentifier, getAllScheduledNotifications } from "@/components/NotificationManager";
import { NotificationRequest } from "expo-notifications";
import TouchableButton from "@/components/TouchableButton";
import { colors } from "@/constants/Colors";

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
    <SafeAreaView style={[GeneralStyle.container, {justifyContent: 'flex-start', alignItems: 'center'}]}>
      <View style={{height:'80%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
      <Text style={[GeneralStyle.BoldInputLabelText,{fontSize:18,paddingHorizontal:'5%',paddingBottom:10, width:'100%'}]}>Notifications</Text>
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
        ListEmptyComponent={() => (
           <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No reminders created yet</Text>
                      <Text style={styles.emptySubText}>Create a reminder and they will appear here!</Text>
          </View>
        )}
        ListFooterComponent={() => (
        reminders.length > 0?<View style={{width:'100%', alignItems:'center', marginTop: 10}}> 
        <TouchableButton widthBut={'60%'} title="Delete all Notifications" onPress={async () => {
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
          </View>:null
        )}
      />
      
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  reminderText: {
    fontSize: 16,
    flexShrink: 1,
  },
  emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 50,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
    },
    emptySubText: {
      fontSize: 16,
      color: colors.Grey,
      textAlign: 'center',
    },
});