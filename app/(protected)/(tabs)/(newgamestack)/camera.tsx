import { View, Text, StyleSheet, Image, Button, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import { GeneralStyle, TextStyles } from "@/constants/Styles";

export default function CameraScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState('');
  const [cameraPermission, requestPermission] = ImagePicker.useCameraPermissions();

  const verifyPermission = async () => {
    if (cameraPermission?.granted) {
      return true;
    }
    
    const permissionResult = await requestPermission();
    return permissionResult.granted;
  };

  const takeImageHandler = async () => {
    try {
      const hasPermission = await verifyPermission();
      
      if (!hasPermission) {
        alert("You need to grant camera permissions to take a photo");
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error taking photo:', err);
      alert('Failed to take photo');
    }
  };

  return (
    <SafeAreaView style={GeneralStyle.container}>
      
      <View style={styles.imagePreview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={[TextStyles.mediumText,{position:'absolute',top:'40%'}]}>No image taken yet.</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.cameraButton} onPress={takeImageHandler}>
        <View style={styles.cameraButtonInner} />
      </TouchableOpacity>
      
      {imageUri && (
        <View style={styles.buttonContainer}>
          <Button 
            title="Use This Photo" 
            onPress={() => {
              // Here you would save the photo URI to pass back to NewGame
              // For now, just go back
              router.back();
            }} 
          />
          <Button 
            title="Take Another" 
            onPress={takeImageHandler} 
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imagePreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  cameraButton: {
    position:'absolute',
    bottom:'20%',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 4,
    borderColor: 'gray',
  },
  cameraButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'lightgray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  }
});