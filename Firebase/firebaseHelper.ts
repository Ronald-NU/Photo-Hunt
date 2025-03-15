import { collection, addDoc, doc, deleteDoc, getDocs, getDoc, updateDoc, setDoc } from "firebase/firestore"; 
import { auth, database } from "./firebaseSetup";
import { UserData } from "@/Firebase/DataStructures";
/*
Create new documents in the database
*/
export const createUserDocument = async (collectionName: string, data: UserData) => {
    try {
        const docRef = await addDoc(collection(database, collectionName), data);
        return docRef.id;
    } catch (e) {
        return e;
    }
}

/*
Update documents in the database
*/
export const updateUserDocument = async (collectionName: string, docId: string, data: any) => {
    try {
        await updateDoc(doc(database, collectionName, docId), data);
        return true;
    } catch (e) {
        return e;
    }
}

/*
Delete documents in the database
*/
export const deleteUserDocument = async (collectionName: string, docId: string) => {
    try {
        await deleteDoc(doc(database, collectionName, docId));
        return true;
    } catch (e) {
        return e;
    }
}