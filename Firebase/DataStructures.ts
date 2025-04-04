// A user of the file which stores there 
// name, email, uid, photoURL, code,
// list of all friends ministructures (Codes, Name) and puzzle mini structure (Name, ID)
export const CollectionUser = "Users";
export const CollectionPuzzle = "Puzzles";
export const CollectionPlay = "Plays";
export const CollectionRequests = "Requests";

export interface UserData {
    id?: string;  // Optional because it's added after fetching from Firestore
    name: string;
    email: string;
    uid: string;
    photoURL: string;
    code: string;
    score: number;
    friends: FriendMiniData[];
    mypuzzles: PuzzleMiniData[];
    geoLocation: geoLocationData;
}

export type UserCreateData = {
    name: string;
    email: string;
    uid: string;
    geoLocation: geoLocationData;
};

// A puzzle mini structure which stores the name and ID of the puzzle
export type PuzzleMiniData = {
    id: string;
    name: string;
    difficulty: number;
};

// A friend mini structure which stores the name and code of the friend
export type FriendMiniData = {
    id: string;
    name: string;
};

export type PuzzleData = {
    id: string;
    creatorID: string;
    name: string;
    geoLocation: geoLocationData;
    photoURL: string;
    difficulty: number;
};

export type geoLocationData = {
    latitude: number;
    longitude: number;
};

export type PlayData = {
    puzzleID: string;
    playerID: string;
    name: string;
    score: number;
};

export type FriendRequest = {
    id?: string;
    friendCode: string;
    requesterCode: string;
    name:string;
    friendName: string;
    status: STATUS;
}
export type STATUS = 'PENDING'|'ACCEPTED'|'REJECTED';