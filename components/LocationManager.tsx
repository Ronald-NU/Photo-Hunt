import { View, Text, Alert } from "react-native";
import { getCurrentPositionAsync, useForegroundPermissions, Accuracy, watchPositionAsync, reverseGeocodeAsync } from "expo-location";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./UserContext";
import { geoLocationData, PuzzleData, UserData } from "@/Firebase/DataStructures";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import TouchableButton from "./TouchableButton";
import { GeneralStyle } from "@/constants/Styles";
import { updateUserDocument } from "@/Firebase/firebaseHelperUsers";
import { getLocalPuzzles, haversineDistance } from "@/Firebase/firebaseHelperPuzzles";
import { SelectedLocation } from "@/app/(protected)/(tabs)/(mapstack)";

interface LocationManagerProps {
  onLocationSelect?: (location: SelectedLocation) => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({ onLocationSelect }) => {
    const [response, requestPermission] = useForegroundPermissions();
    const [mylocation, setLocation] = useState<geoLocationData>();
    const [puzzles, setPuzzles] = useState<PuzzleData[]>();
    const [selectedMarker, setSelectedMarker] = useState<SelectedLocation | null>(null);
    const prevLocationRef = useRef<geoLocationData | undefined>();
    const { user, id } = useUser();

    const lastFetchTimeRef = useRef<number | undefined>(); // Track the last fetch time
    const fetchInterval = 30 * 60 * 1000;

    const handleMapPress = async (event: MapPressEvent) => {
      const { coordinate } = event.nativeEvent;
      try {
        const address = await reverseGeocodeAsync({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude
        });

        if (address.length > 0) {
          const location: SelectedLocation = {
            name: address[0].name || `${address[0].street || ''} ${address[0].city || ''}`.trim(),
            latitude: coordinate.latitude,
            longitude: coordinate.longitude
          };
          setSelectedMarker(location);
          onLocationSelect?.(location);
        }
      } catch (error) {
        console.error('Error getting location name:', error);
      }
    };

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

    //Gets puzzzle changes based on distance
    useEffect(() => {
        const getPuzzlesDistance = async () => {
            if (mylocation && prevLocationRef.current) {
                const prevLocation = prevLocationRef.current;
                const distance = haversineDistance(
                    { latitude: prevLocation.latitude, longitude: prevLocation.longitude },
                    { latitude: mylocation.latitude, longitude: mylocation.longitude }
                );

                if (distance >= 40) {
                    const puzzles = await getLocalPuzzles(mylocation) as PuzzleData[];
                    setPuzzles(puzzles);
                }
            } else {
                if (mylocation) {
                    const puzzles = await getLocalPuzzles(mylocation) as PuzzleData[];
                    setPuzzles(puzzles);
                }
            }

            // Update the previous location reference
            prevLocationRef.current = mylocation;
        };

        getPuzzlesDistance();
    }, [mylocation]);

    useEffect(() => {
        const getPuzzlesTime = async () => {
            const currentTime = Date.now(); // Get the current timestamp

            // Check if enough time has passed since the last fetch
            if (!lastFetchTimeRef.current || currentTime - lastFetchTimeRef.current >= fetchInterval) {
                if (mylocation) {
                    try {
                        const puzzles = await getLocalPuzzles(mylocation) as PuzzleData[];
                        setPuzzles(puzzles);
                        lastFetchTimeRef.current = currentTime; // Update the last fetch time
                    } catch (error) {
                        console.error('Error fetching puzzles:', error);
                        setPuzzles([]);
                    }
                }
            }
        };

        // Fetch puzzles on first mount or when the location changes
        getPuzzlesTime();

        // Set up an interval to periodically check for new puzzles
        const intervalId = setInterval(() => {
            getPuzzlesTime();
        }, fetchInterval);

        // Cleanup the interval on component unmount
        return () => {
            clearInterval(intervalId);
        };
    }, []);

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
        onPress={handleMapPress}
        >
            {puzzles && puzzles.map((puzzle) => {
                if (haversineDistance(puzzle.geoLocation, mylocation) <= 10) {
                    return (
                        <Marker
                            key={puzzle.id}
                            pinColor="red"
                            coordinate={puzzle.geoLocation}
                            title={puzzle.name}
                        />
                    );
                }
                return null;
            })}
            {selectedMarker && (
                <Marker
                    coordinate={{
                        latitude: selectedMarker.latitude,
                        longitude: selectedMarker.longitude
                    }}
                    pinColor="blue"
                    title={selectedMarker.name}
                />
            )}
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