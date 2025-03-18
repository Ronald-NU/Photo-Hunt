import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, storage } from "./firebaseSetup";
import { ref, uploadBytesResumable } from "firebase/storage";

interface FirestoreUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};


export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};


export const authStateListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};


export const addUserData = async (userId: string, name: string) => {
  try {
    await setDoc(doc(db, "users", userId), {
      name,
      createdAt: new Date()
    });
    console.log("User data added!");
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

export const fetchUsers = async (): Promise<FirestoreUser[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      
      const users: FirestoreUser[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<FirestoreUser, "id">,
        createdAt: new Date(doc.data().createdAt)
      }));
  
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  export const storeImage = async (imageURI :string) =>{
    const response = await fetch(imageURI);
    const blob = await response.blob();

    const imageName = imageURI.substring(imageURI.lastIndexOf('/') + 1);
    const imageRef = ref(storage, `images/${imageName}`)
    const uploadResult = await uploadBytesResumable(imageRef, blob);
    return uploadResult.ref.fullPath;
  }