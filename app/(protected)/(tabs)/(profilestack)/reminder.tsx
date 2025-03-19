import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function ReminderScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState([
    { id: "1", text: 'Complete "Park Puzzle" at 5:00pm' },
    { id: "2", text: 'Complete "Puzzle 2" on Jan.1st' },
    { id: "3", text: 'Complete "Puzzle 3" on July 25th' },
  ]);

  // 删除提醒的函数
  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ❌ 删除这里的 header，StackLayout 已经提供返回按钮 */}
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteReminder(item.id)}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingTop: 20 },
  reminderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  reminderText: {
    fontSize: 16,
    flexShrink: 1,
  },
});