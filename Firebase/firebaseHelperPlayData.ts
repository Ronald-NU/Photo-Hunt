import { collection, addDoc, doc, deleteDoc, getDocs, updateDoc } from "firebase/firestore"; 
import { database } from "./firebaseSetup";
import { CollectionPlay, PlayData, PuzzleData } from "@/Firebase/DataStructures";

//New Leaderboard Creation (called before puzzle has been created)
export const createLeaderBoardDocument = async (data: PuzzleData) => {
    try {
        const docRef = await addDoc(collection(database, CollectionPlay), data);
        return docRef.id;
    } catch (e) {
        return e;
    }
}


//querys the puzzle leaderboard data by querying the playdata collection
export const getPuzzleLeaderBoard = async (puzzleID: string) => {
    try {
        const querySnapshot = await getDocs(collection(database, CollectionPlay));
        var leaderboard:PlayData[] = []; 
        querySnapshot.forEach((doc) => {
            var docData = doc.data() as PlayData;
            if (puzzleID === docData.puzzleId) {
                leaderboard.push(doc.data() as PlayData);
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
        await updateDoc(doc(database, CollectionPlay, id), data);
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
        await deleteDoc(doc(database, CollectionPlay, id));
        return true;
    } catch (e) {
        return e;
    }
}