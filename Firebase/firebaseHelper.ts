import { collection, addDoc, doc, deleteDoc, getDocs, getDoc, updateDoc, setDoc } from "firebase/firestore"; 
import { auth, database } from "./firebaseSetup";
import { UserCreateData, UserData } from "@/Firebase/DataStructures";
/*
Create new documents in the database
*/
const CollectionUser = "Users";
const CollectionPuzzle = "Puzzles";
const CollectionLeaderBoard = "LeaderBoards";
const CollectionPlay = "Plays";

//New User Creation
export const createUserDocument = async (data: UserCreateData) => {
    try {
        const NewUserData : UserData = {
            name: data.name,
            email: data.email,
            uid: data.uid,
            photoURL: "",
            code: generateFriendCode(),
            score: 0,
            friends: [],
            puzzles: [],
            geoLocation: data.geoLocation,
        }
        const docRef = await addDoc(collection(database, CollectionUser), NewUserData);
        return docRef.id;
    } catch (e) {
        return e;
    }
}

//generates a random "unquie" friend code (add query to make sure hasn't been used)
const generateFriendCode = () => {
    return "#" + Math.random().toString(36).slice(2,8).toUpperCase();
}

/*
Get documents from the database
*/
//Gets user data from the database based on the user's uid
export const getUserData = async (uid: string) => {
    try {
        const querySnapshot = await getDocs(collection(database, CollectionUser));
        querySnapshot.forEach((doc) => {
            if (doc.data().uid === uid) {
                return doc.data();
            }
        });
        return null;
    } catch (e) {
        return e;
    }
}

//querys the database by friend code to get the user's uid
export const getUserUID = async (code: string) => {
    try {
        const querySnapshot = await getDocs(collection(database, CollectionUser));
        querySnapshot.forEach((doc) => {
            if (doc.data().code === code) {
                return doc.data().uid;
            }
        });
        return null;
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