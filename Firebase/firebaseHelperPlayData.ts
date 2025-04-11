import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc } from "firebase/firestore"; 
import { db } from "./firebaseSetup";
import { CollectionPlay, PlayData, PuzzleData } from "@/Firebase/DataStructures";

//New Leaderboard Creation (called before puzzle has been created)
export const createPlayDocument = async (data: PlayData) => {
    try {
        const docRef = await addDoc(collection(db, CollectionPlay), data);
        return docRef.id;
    } catch (e) {
        return e;
    }
}

//querys the puzzle leaderboard data by querying the playdata collection
export const getPuzzleLeaderBoard = async (puzzleID: string) => {
    try {
        const querySnapshot = await getDocs(collection(db, CollectionPlay));
        const leaderboard: (PlayData & { id: string })[] = []; 
        querySnapshot.forEach((doc) => {
            const docData = doc.data() as PlayData;
            if (puzzleID === docData.puzzleID) {
                leaderboard.push({ ...docData, id: doc.id });
            }
        });
        return leaderboard;
    } catch (e) {
        return e;
    }
}

// updates the play data of a specific player for a for the database
export const updatePlayDataDocument = async (id: string, data: PlayData) => {
    try {
        await updateDoc(doc(db, CollectionPlay, id), data);
        return true;
    } catch (e) {
        return e;
    }
}

/*
Delete Playdata document in the database
*/
export const deletePlayDataDocument = async (id: string) => {
    try {
        await deleteDoc(doc(db, CollectionPlay, id));
        return true;
    } catch (e) {
        return e;
    }
}