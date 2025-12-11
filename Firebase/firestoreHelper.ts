import { storage } from "./firebaseSetup";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
/**

 * @param uri 
 * @returns 
 */
/**
 * Compress image to reduce file size
 * @param uri - Image URI to compress
 * @param maxWidth - Maximum width (default 1024px)
 * @param quality - Compression quality 0-1 (default 0.7)
 * @returns Compressed image URI
 */
const compressImage = async (
  uri: string, 
  maxWidth: number = 1024, 
  quality: number = 0.7
): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }], // Limit maximum width
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * Generic file upload utility function
 * @param fileUri - File URI
 * @param folderPath - Storage path (excluding filename)
 * @param metadata - Optional metadata
 * @returns File download URL
 */
export const uploadAndReturnUrl = async (
  fileUri: string,
  folderPath: string,
  metadata: { [key: string]: string } = {}
): Promise<string> => {
  try {
    // Verify storage bucket
    console.log("🔥 Active Storage Bucket:", storage.app.options.storageBucket);
    if (storage.app.options.storageBucket !== "photo-hunt-9b1da.appspot.com") {
      throw new Error("Storage bucket configuration mismatch");
    }

    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Compress image if it's an image file
    let finalUri = fileUri;
    if (fileUri.toLowerCase().endsWith('.jpg') || 
        fileUri.toLowerCase().endsWith('.jpeg') || 
        fileUri.toLowerCase().endsWith('.png')) {
      console.log('Compressing image...');
      finalUri = await compressImage(fileUri);
      console.log('Image compressed:', finalUri);
    }

    // Create a unique filename
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, `${folderPath}/${user.uid}/${fileName}`);

    console.log('Starting file upload...');
    console.log('Storage path:', `${folderPath}/${user.uid}/${fileName}`);

    // Read the file as a blob
    const response = await fetch(finalUri);
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    const blob = await response.blob();
    console.log('File size after compression:', blob.size);

    // Check if file is too large
    if (blob.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File is too large after compression');
    }

    // Prepare metadata
    const fullMetadata = {
      ...metadata,
      uploadedBy: user.uid,
      uploadedAt: new Date().toISOString(),
      originalSize: blob.size.toString()
    };

    // Upload the blob
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: blob.type || 'application/octet-stream',
      customMetadata: fullMetadata
    });

    // Wait for the upload to complete
    const snapshot = await uploadTask;
    console.log('Upload completed:', snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};

/**
 * Function specifically for uploading puzzle images
 * @param imageURI - Image URI
 * @returns Image download URL
 */
export const storeImage = async (imageURI: string): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const path = `puzzles/${user.uid}/${fileName}`;
    const storageRef = ref(storage, path);

    console.log("🚀 Uploading to:", path);

    // Directly use fetch to get file data
    const response = await fetch(imageURI);
    if (!response.ok) {
      throw new Error('Failed to fetch image data');
    }
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`📤 Upload is ${progress.toFixed(2)}% done`);
        },
        (error) => {
          console.error("❌ Upload error:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("✅ File available at:", downloadURL);
          resolve(downloadURL);
        }
      );
    });

  } catch (err) {
    console.error("🔥 Upload failed:", err);
    throw err;
  }
};

/**
 * Upload image to Firebase Storage with compression for Azure Vision API compatibility
 * This function compresses images to ensure they're under Azure's 4MB limit
 * @param fileUri - Image file URI
 * @param folderPath - Storage folder path
 * @returns Download URL of uploaded image
 */
export const uploadImageAzureFirebase = async (fileUri: string, folderPath: string): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    console.log('📸 Starting image upload with compression for Azure compatibility...');
    
    // Compress image before upload to ensure it's under Azure's 4MB limit
    // Azure Vision API has a 4MB limit, so we compress to be safe
    let finalUri = fileUri;
    const isImageFile = fileUri.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
    
    if (isImageFile) {
      console.log('🔄 Compressing image for Azure Vision API compatibility...');
      try {
        // Compress image more aggressively for Azure Vision API
        // Resize to max 1024px width and 60% quality to ensure < 4MB
        finalUri = await compressImage(fileUri, 1024, 0.6);
        console.log('✅ Image compressed successfully');
      } catch (compressError) {
        console.warn('⚠️ Compression failed, using original image:', compressError);
        // Continue with original if compression fails
      }
    }

    // Create unique filename
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, `${folderPath}/${user.uid}/${fileName}`);

    // Read file as blob
    const response = await fetch(finalUri);
    if (!response.ok) throw new Error(`Failed to read file: ${response.statusText}`);
    const blob = await response.blob();
    
    // Log file size for debugging
    const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 File size after compression: ${fileSizeMB} MB`);
    
    // Check if file is still too large (Azure limit is 4MB)
    if (blob.size > 4 * 1024 * 1024) {
      console.error(`❌ File size (${fileSizeMB} MB) exceeds Azure Vision API limit (4MB)`);
      throw new Error(
        `Image is too large (${fileSizeMB} MB) even after compression. ` +
        `Azure Vision API requires images under 4MB.`
      );
    }

    // Upload the file
    console.log('📤 Uploading compressed image to Firebase Storage...');
    const uploadTask = uploadBytesResumable(storageRef, blob);
    const snapshot = await uploadTask;

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Image uploaded successfully, size:', fileSizeMB, 'MB');
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

export const deleteImage = async (downloadURL: string) => {
  try {
    const storageRef = ref(storage, downloadURL);
    await deleteObject(storageRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};