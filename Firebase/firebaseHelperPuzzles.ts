import { collection, addDoc, doc, deleteDoc, getDocs } from "firebase/firestore"; 
import { db } from "./firebaseSetup";
import { CollectionPuzzle, PuzzleData, geoLocationData } from "@/Firebase/DataStructures";

// Function to calculate distance between two points on Earth
export const haversineDistance = (point1: geoLocationData, point2: geoLocationData): number => {
    const R = 3958.8; // Earth's radius in miles
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
};

//New puzzle Creation
export const createPuzzleDocument = async (userID: string, data: PuzzleData) => {
    try {
        console.log('Creating puzzle document with data:', data);
        const NewPuzzleData : PuzzleData = {
            id: data.id,
            creatorID: userID,
            name: data.name,
            geoLocation: data.geoLocation,
            photoURL: data.photoURL,
            difficulty: data.difficulty,
        }
        console.log('Formatted puzzle data:', NewPuzzleData);
        const docRef = await addDoc(collection(db, CollectionPuzzle), NewPuzzleData);
        console.log("Puzzle document created with ID:", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error creating puzzle document:", e);
        return null;
    }
}

//Gets puzzle data from the database puzzle's id
export const getPuzzleData = async (id: string): Promise<PuzzleData | null> => {
    try {
        console.log('Fetching puzzle data for ID:', id);
        const querySnapshot = await getDocs(collection(db, CollectionPuzzle));
        let foundPuzzle: PuzzleData | null = null;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Checking document:', doc.id, data);
            if (data.id === id) {
                foundPuzzle = {
                    id: data.id,
                    creatorID: data.creatorID,
                    name: data.name,
                    photoURL: data.photoURL,
                    difficulty: data.difficulty,
                    geoLocation: {
                        latitude: data.geoLocation.latitude,
                        longitude: data.geoLocation.longitude
                    }
                } as PuzzleData;
                console.log('Found matching puzzle:', foundPuzzle);
            }
        });
        
        if (!foundPuzzle) {
            console.log("No puzzle found with id:", id);
        }
        return foundPuzzle;
    } catch (e) {
        console.error("Error getting puzzle data:", e);
        return null;
    }
}

//querys the database by location puzzles near the user
export const getLocalPuzzles = async (currentLocation: geoLocationData) => {
    try {
        console.log('Fetching local puzzles for location:', currentLocation);
        const querySnapshot = await getDocs(collection(db, CollectionPuzzle));
        const nearbyPuzzles: PuzzleData[] = []; // Store all matching puzzles
        
        console.log('Total puzzles in database:', querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Processing puzzle:', {
                id: data.id,
                name: data.name,
                location: data.geoLocation
            });
            
            var loc = data.geoLocation as geoLocationData;
            const distance = haversineDistance(loc, currentLocation);
            console.log('Distance calculation:', {
                puzzleName: data.name,
                puzzleLocation: loc,
                currentLocation: currentLocation,
                distance: distance
            });
            
            //return puzzles within 100 miles
            if (distance <= 100) {
                console.log('Adding puzzle to nearby list:', data.name);
                nearbyPuzzles.push(data as PuzzleData);
            } else {
                console.log('Puzzle too far:', data.name, 'Distance:', distance);
            }
        });
        
        console.log('Final nearby puzzles count:', nearbyPuzzles.length);
        console.log('Nearby puzzles:', nearbyPuzzles.map(p => ({ name: p.name, distance: haversineDistance(p.geoLocation, currentLocation) })));
        return nearbyPuzzles;
    } catch (e) {
        console.error("Error getting local puzzles:", e);
        return [];
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