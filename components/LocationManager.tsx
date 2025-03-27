import { View, Text, Alert } from "react-native";
import { getCurrentPositionAsync, useForegroundPermissions, Accuracy, watchPositionAsync } from "expo-location";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { geoLocationData, UserData } from "@/Firebase/DataStructures";
import MapView from "react-native-maps";
import TouchableButton from "./TouchableButton";
import { GeneralStyle } from "@/constants/Styles";
import { updateUserDocument } from "@/Firebase/firebaseHelperUsers";

const LocationManager = () => {
    const [response, requestPermission] = useForegroundPermissions();
    const [mylocation, setLocation] = useState<geoLocationData>();
    const { user, id } = useUser();
    useEffect(()=>{
    const trackLocation = async () => {
        if(await verifyPermissions()){
        const locationSubscription = await watchPositionAsync(
            {
              accuracy: Accuracy.High,
              timeInterval: 2000, // Update every 2 seconds
              distanceInterval: 1, // Update when moved by 1 meter
            },
            (newLocation) => {
              setLocation(newLocation.coords);
            }
          );
          if (user) {
            var userData: UserData = user;
          
            if (mylocation?.latitude && mylocation?.longitude) {
              // Check if previous location exists
              if (!userData.geoLocation) {
                userData.geoLocation = mylocation; // First-time location save
                updateUserDocument(id, userData);
              } else {
                // Calculate distance from the last stored location
                const distance = haversineDistance(userData.geoLocation, mylocation);
          
                if (distance > 10) { // Only update if moved > 10 miles
                  userData.geoLocation = mylocation;
                  updateUserDocument(id, userData);
                }
              }
            }
          }
          return () => locationSubscription.remove(); // Cleanup on unmount
        }
    }
    trackLocation();
    },[,response])

    const locateUserHandler = async () => {
        await verifyPermissions();
    }
    const verifyPermissions = async () => {
        if(response?.granted) return true;
        if(response?.granted){
            if(!response.granted){
            Alert.alert("Location Request","We are requestion permission to use your location so that we can show you the map and the Photo Hunts in your area without granting perission we are unable to show you the Photo Hunts!")
            }
        }
        const result = await requestPermission();
        return result.granted;
    }

if(response?.granted && mylocation){
  return (
    <MapView style={{flex:1, width:'100%'}} initialRegion={{
        latitude: mylocation.latitude,
        longitude: mylocation.longitude,
        longitudeDelta:0.05,
        latitudeDelta:0.05}}
        showsUserLocation={true}
        followsUserLocation={true}
        >
    </MapView>
  )
}else{
    return (
        <View style={GeneralStyle.container}>
            <Text style={GeneralStyle.title}>Map</Text>
            <TouchableButton title="View Local Puzzles" onPress={locateUserHandler}/>
        </View>
    )
}
}

export default LocationManager