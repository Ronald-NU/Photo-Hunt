import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc, setDoc } from "firebase/firestore"; 
import { db } from "./firebaseSetup";
import { UserCreateData, UserData, CollectionUser, geoLocationData } from "@/Firebase/DataStructures";

//New User Creation
export const createUserDocument = async (data: UserCreateData) => {
    try {
        const NewUserData : UserData = {
            name: data.name,
            email: data.email,
            uid: data.uid,
            photoURL: "",
            code: await generateFriendCode(),
            score: 0,
            friends: [],
            mypuzzles: [],
            geoLocation: data.geoLocation,
        }
        const docRef = await addDoc(collection(db, CollectionUser), NewUserData);
        return docRef.id;
    } catch (e) {
        return e;
    }
}

//generates a random unquie friend code (add query to make sure hasn't been used)
const generateFriendCode = async () => {
    var unquieCode = false;
    var code = "";
    while(!unquieCode){
    var code = "#" + Math.random().toString(36).slice(2,8).toUpperCase();
    //check if code is already in use
    await getFriend(code).then((data) => {
        if(data === null){
            unquieCode = true;
        }
    });
    }
    return code;
}
//Gets user data from the database based on the user's uid
export const getUserData = async (uid: string) => {
    try {
        const querySnapshot = await getDocs(collection(db, CollectionUser));
        var user;
        for (const doc of querySnapshot.docs) {
            if (doc.data().uid === uid) {
                const userData = doc.data() as UserData;
                user ={
                    ...userData,
                    id: doc.id,
                    mypuzzles: userData.mypuzzles || []
                };

            }
        }
        return user;
    } catch (e) {
        console.error("Error getting user data:", e);
        return null;
    }
}

//querys the database by friend code to get the user's uid
export const getFriend = async (code: string) => {
    try {
        const querySnapshot = await getDocs(collection(db, CollectionUser));
        var friend = null;
        querySnapshot.forEach((doc) => {
            if (doc.data().code === code) {
                const userData = doc.data();
                friend = {
                    ...userData,
                    mypuzzles: userData.mypuzzles || []
                };
            }
        });
        return friend;
    } catch (e) {
        return e;
    }
}

/*
Update User document in the database
*/
export const updateUserDocument = async (docId: string, data: any) => {
    try {
        await updateDoc(doc(db, CollectionUser, docId), data);
        return true;
    } catch (e) {
        return e;
    }
}

//querys the puzzle leaderboard data by querying the playdata collection
export const getLocalLeaderBoard = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, CollectionUser)); 
        var leaderboard : UserData[] = [];
        querySnapshot.forEach((doc) => {
            var docData = doc.data() as UserData
            //within 100 miles of a location add to the leaderboard array
            leaderboard.push(docData as UserData);
            /*if (Math.abs(docData.geoLocation.latitude - location.latitude) < 1 && Math.abs(docData.geoLocation.longitude - location.longitude) < 1) {
                leaderboard.push(docData as UserData);
            }*/
        });
        return leaderboard;
    } catch (e) {
        return e;
    }
}

/*
Delete user document in the database
*/
export const deleteUserDocument = async (docId: string) => {
    try {
        await deleteDoc(doc(db, CollectionUser, docId));
        return true;
    } catch (e) {
        return e;
    }
}