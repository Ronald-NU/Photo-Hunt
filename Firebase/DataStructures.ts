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
    isCompleted?: boolean; // 是否完成
    moves?: number; // 完成所需的移动次数
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
    photoURL: string; // Store image URL instead of base64 data
    difficulty: number;
};

export type geoLocationData = {
    latitude: number;
    longitude: number;
};

export type PlayData = {
    id?: string;  // Optional because it's added after fetching from Firestore
    puzzleID: string;
    playerID: string;
    name: string;
    score: number;
    isCompleted?: boolean;
    isPhotoVerified?: boolean;
    verificationTimestamp?: number;
    imageSimilarity?: number;
};

export type FriendRequest = {
    id?: string;
    friendCode: string;
    friendName: string;
    requesterCode: string;
    name:string;
    status: STATUS;
}
export type STATUS = 'PENDING'|'ACCEPTED'|'REJECTED';