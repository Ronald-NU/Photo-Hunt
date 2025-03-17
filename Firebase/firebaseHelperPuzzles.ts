import { collection, addDoc, doc, deleteDoc, getDocs, getDoc, updateDoc, setDoc } from "firebase/firestore"; 
import { database } from "./firebaseSetup";
import { CollectionPuzzle, PuzzleData, geoLocationData } from "@/Firebase/DataStructures";

//New puzzle Creation (called after leaderboard has been created)
export const createPuzzleDocument = async (userID: string, leaderBoardId:string, data: PuzzleData) => {
    try {
        const NewPuzzleData : PuzzleData = {
            id: data.id,
            userID: userID,
            name: data.name,
            leaderBoardId: leaderBoardId,
            geoLocation: data.geoLocation,
            photoURL: data.photoURL,
            difficulty: data.difficulty,
        }
        const docRef = await addDoc(collection(database, CollectionPuzzle), NewPuzzleData);
        return docRef.id;
    } catch (e) {
        return e;
    }
}

//Gets puzzle data from the database puzzle's id
export const getPuzzleData = async (id: string) => {
    try {
        const querySnapshot = await getDocs(collection(database, CollectionPuzzle));
        querySnapshot.forEach((doc) => {
            if (doc.data().id === id) {
                return doc.data();
            }
        });
        return null;
    } catch (e) {
        return e;
    }
}

//querys the database by location puzzles near the user
export const getLocalPuzzles = async (currentLocation: geoLocationData) => {
    try {
        const querySnapshot = await getDocs(collection(database, CollectionPuzzle));
        querySnapshot.forEach((doc) => {
            var loc = doc.data().geoLocation as geoLocationData
            //return puzzles within 10 miles
            if (Math.abs(loc.latitude - currentLocation.latitude) < 0.1 && Math.abs(loc.longitude - currentLocation.longitude) < 0.1) {
                return doc.data();
            }
        });
        return null;
    } catch (e) {
        return e;
    }
}

/*
Delete user document in the database
*/
export const deletePuzzleDocument = async (id: string) => {
    try {
        await deleteDoc(doc(database, CollectionPuzzle, id));
        return true;
    } catch (e) {
        return e;
    }
}