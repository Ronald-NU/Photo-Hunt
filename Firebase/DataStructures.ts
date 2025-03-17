// A user of the file which stores there 
// name, email, uid, photoURL, code,
// list of all friends ministructures (Codes, Name) and puzzle mini structure (Name, ID)
export const CollectionUser = "Users";
export const CollectionPuzzle = "Puzzles";
export const CollectionPlay = "Plays";

export type UserData = {
    name: string;
    email: string;
    code: string;
    uid: string;
    photoURL: string;
    score: number;
    friends: FriendMiniData[];
    mypuzzles: PuzzleMiniData[];
    geoLocation: geoLocationData;
};

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
    puzzleId: string;
    playerId: string;
    name: string;
    score: number;
};