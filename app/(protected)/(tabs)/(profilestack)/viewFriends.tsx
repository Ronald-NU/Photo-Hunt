import ProfileNavSections from "@/components/ProfileNavSections";
import { useUser } from "@/components/UserContext";
import { GeneralStyle } from "@/constants/Styles";
import { FriendMiniData, FriendRequest } from "@/Firebase/DataStructures";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import FriendAcceptRequestBox from "@/components/FriendAcceptRequestBox";
import { acceptDenyFriend, getFriendRequest, sendFriendRequest } from "@/Firebase/firebaseHelperRequest";
import { colors } from "@/constants/Colors";


export default function ViewFriendsScreen() {
  const [friends, setFriends] = useState<FriendMiniData[]>([]);
  const [requests, setRequsts] = useState<FriendRequest[]>([]);
  const {user, id} = useUser();
 const [searchQuery, setSearchQuery] = useState('');
  const [refresh, setRefresh] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if(user){
        setFriends(user.friends);
      }
    }, [user, refresh])
  );

  useEffect(()=>{
    const request: { requests: FriendRequest[] } = { requests: [] };
    const getFriends = async () =>{
    if(user!){
      const allRequest = await getFriendRequest(id, user?.code, user) as FriendRequest[]
      request.requests = allRequest;
    }
  }
  getFriends().then(()=>{
    setRequsts(request.requests);
    setRefresh(!refresh);
  });
  },[])

  function handleSearch(text: string): void {
    setSearchQuery(text);
  }

  const onAcceptRequest = (request:FriendRequest) => {
    const newRequest:FriendRequest = {
      friendCode: request.friendCode,
      requesterCode: request.requesterCode,
      name: request.name,
      status: "PENDING"
    }
    if(request.id && user){
    acceptDenyFriend(request.id, newRequest,'ACCEPTED',user);
    }
  }

  const onCancelRequest = (request:FriendRequest) => {
    if(request.id && user){
      const newRequest:FriendRequest = {
        friendCode: request.friendCode,
        requesterCode: request.requesterCode,
        name: request.name,
        status: "PENDING"
      }
    acceptDenyFriend(request.id, newRequest,'REJECTED',user);
    }
  }

  const sendRequest = async () => {
    var exist = false;
    if(searchQuery.length < 6){
      Alert.alert("No Request Sent", "Invalid Friend Code")
      return;
    }
    requests.forEach((request)=>{
      if(request.friendCode === searchQuery){
        Alert.alert("No Request Sent", "Already Sent Request")
        exist = true;
        return;
      }
    })
    user?.friends.forEach((friend)=>{
      if(friend.id === searchQuery){
        Alert.alert("No Request Sent", "Already Friends")
        exist = true;
        return;
      }
    })
    if(exist){
      return;
    }
    if(user){
     const requestStatus = await sendFriendRequest(searchQuery, user);
     if(!requestStatus){
      Alert.alert("No Request Sent", "Incorrect Friend Code")
     } else {
      Alert.alert("Friend Request Sent")
      setSearchQuery("");
     }
    }
  }

  const onSelectFriend = () => {}

  return (
    <SafeAreaView style={GeneralStyle.container}>
      <View style={{height:40, width:'90%', marginBottom: 10, flexDirection:'row', 
        justifyContent:'space-evenly',
        alignContent:'space-between'}}>
       <View style={[styles.searchContainer,{width:'20%', flexGrow:1, marginRight:10}]}>
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
              <TouchableOpacity 
                    style={{backgroundColor:colors.Primary, padding:8, borderRadius:8}}
                    onPress={sendRequest}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={colors.White} />
                  </TouchableOpacity>
              </View>
            
      <View style={{marginBottom: 10, width:'100%', height:'25%'}}>
        <Text style={[GeneralStyle.BoldInputLabelText,{fontSize:18,paddingHorizontal:'5%',paddingBottom:10}]}>Requests</Text>
      <FlatList
        style={{width:'100%'}}
        data={requests}
        keyExtractor={(item) => (item.friendCode+item.requesterCode)}
        renderItem={({ item }) => (
          <FriendAcceptRequestBox onPressAccept={()=>onAcceptRequest(item)} onPressCancel={()=>onCancelRequest(item)} title={item.name}/>
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