import { storage } from "./firebaseSetup";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**

 * @param uri 
 * @returns 
 */
const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], // 限制最大宽度为1024px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * 通用的文件上传工具函数
 * @param fileUri - 文件URI
 * @param folderPath - 存储路径（不包含文件名）
 * @param metadata - 可选的元数据
 * @returns 文件的下载URL
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
 * 专门用于上传谜题图片的函数
 * @param imageURI - 图片URI
 * @returns 图片的下载URL
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

    // 直接使用 fetch 获取文件数据
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