import ProfileNavSections from "@/components/ProfileNavSections";
import { useUser } from "@/components/UserContext";
import { GeneralStyle } from "@/constants/Styles";
import { FriendMiniData } from "@/Firebase/DataStructures";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import FriendAcceptRequestBox from "@/components/FriendAcceptRequestBox";


export default function ViewFriendsScreen() {
  const [friends, setFriends] = useState<FriendMiniData[]>([]);
  const {user} = useUser();
 const [searchQuery, setSearchQuery] = useState('');
 
  useFocusEffect(
    useCallback(() => {
      if(user){
        setFriends(user.friends);
      }
    }, [user])
  );

  function handleSearch(text: string): void {
    setSearchQuery(text);
  }

  const onAcceptRequest = () => {}

  const onCancelRequest = () => {}

  const onSelectFriend = () => {}

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <View style={{height:40, width:'90%', marginBottom: 10}}>
       <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Add friends by code #AAA111"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholderTextColor="#666"
                />
                {searchQuery ? (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                ) : null
                }
              </View>
            </View>
      <View style={{marginBottom: 10, width:'100%', height:'25%'}}>
        <Text style={[GeneralStyle.BoldInputLabelText,{fontSize:18,paddingHorizontal:'5%',paddingBottom:10}]}>Requests</Text>
      <FlatList
        style={{width:'100%'}}
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendAcceptRequestBox onPressAccept={()=>onAcceptRequest()} onPressCancel={()=>onCancelRequest()} title={item.name}/>
        )}
      />
      </View>
      <View style={{marginBottom: 10, width:'100%', flex:1}}>
        <Text style={[GeneralStyle.BoldInputLabelText,{fontSize:18,paddingHorizontal:'5%',paddingBottom:10}]}>Friends</Text>
      <FlatList
        style={{width:'100%'}}
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfileNavSections onPress={()=>onSelectFriend()} title={item.name}/>
        )}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
});