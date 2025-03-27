import { collection, addDoc, doc, deleteDoc, getDocs } from "firebase/firestore"; 
import { db } from "./firebaseSetup";
import { CollectionPuzzle, PuzzleData, geoLocationData } from "@/Firebase/DataStructures";

//New puzzle Creation
export const createPuzzleDocument = async (userID: string, data: PuzzleData) => {
    try {
        const NewPuzzleData : PuzzleData = {
            id: data.id,
            creatorID: userID,
            name: data.name,
            geoLocation: data.geoLocation,
            photoURL: data.photoURL,
            difficulty: data.difficulty,
        }
        const docRef = await addDoc(collection(db, CollectionPuzzle), NewPuzzleData);
        return docRef.id;
    } catch (e) {
        return e;
    }
}

//Gets puzzle data from the database puzzle's id
export const getPuzzleData = async (id: string) => {
    try {
        const querySnapshot = await getDocs(collection(db, CollectionPuzzle));
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
        const querySnapshot = await getDocs(collection(db, CollectionPuzzle));
        const nearbyPuzzles: PuzzleData[] = []; // Store all matching puzzles

        querySnapshot.forEach((doc) => {
            var loc = doc.data().geoLocation as geoLocationData
            //return puzzles within 10 miles
            if (haversineDistance(loc,currentLocation) <= 100) {
                nearbyPuzzles.push(doc.data() as PuzzleData);
            }
        });
        return nearbyPuzzles.length > 0 ? nearbyPuzzles : null;
    } catch (e) {
        return e;
    }
}

/*
Delete user document in the database
*/
export const deletePuzzleDocument = async (id: string) => {
    try {
        await deleteDoc(doc(db, CollectionPuzzle, id));
        return true;
    } catch (e) {
        return e;
    }
}