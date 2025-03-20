import { storage } from "./firebaseSetup";
import { ref, uploadBytesResumable } from "firebase/storage";

  export const storeImage = async (imageURI :string) =>{
    const response = await fetch(imageURI);
    const blob = await response.blob();

    const imageName = imageURI.substring(imageURI.lastIndexOf('/') + 1);
    const imageRef = ref(storage, `images/${imageName}`)
    const uploadResult = await uploadBytesResumable(imageRef, blob);
    return uploadResult.ref.fullPath;
  }