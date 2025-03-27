import { View, Text } from "react-native";
import { getCurrentPositionAsync, useForegroundPermissions, Accuracy, watchPositionAsync } from "expo-location";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { geoLocationData } from "@/Firebase/DataStructures";
import MapView from "react-native-maps";
import TouchableButton from "./TouchableButton";
import { GeneralStyle } from "@/constants/Styles";

const LocationManager = () => {
    const [response, requestPermission] = useForegroundPermissions();
    const [mylocation, setLocation] = useState<geoLocationData>();
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
          return () => locationSubscription.remove(); // Cleanup on unmount
        }
    }
    trackLocation();
    },[,response])

    const locateUserHandler = async () => {
        await verifyPermissions();
        try{
        if(response?.granted){
            const location = await getCurrentPositionAsync();
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        }
        }
        catch (err) {
            console.log(err);
        }
    }
    const verifyPermissions = async () => {
        if (response?.granted) return true;
            
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