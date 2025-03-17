import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc } from "firebase/firestore"; 
import { database } from "./firebaseSetup";
import { CollectionLeaderBoard, LeaderBoardData, PuzzleData, geoLocationData } from "@/Firebase/DataStructures";

//New Leaderboard Creation (called before puzzle has been created)
export const createLeaderBoardDocument = async (data: PuzzleData) => {
    try {
        const NewLeaderboardData : LeaderBoardData = {
            id: data.id,
            players: [],
        }
        const docRef = await addDoc(collection(database, CollectionLeaderBoard), NewLeaderboardData);
        return docRef.id;
    } catch (e) {
        return e;
    }
}

//Gets leaderboard data from the database puzzle's id
export const getLeaderboardData = async (id: string) => {
    try {
        const querySnapshot = await getDocs(collection(database, CollectionLeaderBoard));
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

//querys the database by location of their local Leaderboard near the user
export const getLocalLeaderboard = async (currentLocation: geoLocationData) => {
    try {
        const querySnapshot = await getDocs(collection(database, CollectionLeaderBoard));
        querySnapshot.forEach((doc) => {
            var loc = doc.data().geoLocation as geoLocationData
            //return Leaderboard within 100 miles
            if (Math.abs(loc.latitude - currentLocation.latitude) < 1 && Math.abs(loc.longitude - currentLocation.longitude) < 1) {
                return doc.data();
            }
        });
        return null;
    } catch (e) {
        return e;
    }
}

// updates the leaderboard of a specific puzzle for the database
export const updateLeaderboardDocument = async (id: string, data: LeaderBoardData) => {
    try {
        await updateDoc(doc(database, CollectionLeaderBoard, id), data);
        return true;
    } catch (e) {
        return e;
    }
}

/*
Delete leaderboard with puzzle document in the database
*/
export const deleteLeaderboardDocument = async (id: string) => {
    try {
        await deleteDoc(doc(database, CollectionLeaderBoard, id));
        return true;
    } catch (e) {
        return e;
    }
}