// A user of the file which stores there 
// name, email, uid, photoURL, code,
// list of all friends ministructures (Codes, Name) and puzzle mini structure (Name, ID)
export type UserData = {
    name: string;
    email: string;
    code: string;
    uid: string;
    photoURL: string;
    //combination of all plays
    score: number;
    friends: FriendMiniData[];
    puzzles: PuzzleMiniData[];
};

// A puzzle mini structure which stores the name and ID of the puzzle
export type PuzzleMiniData = {
    id: string;
    name: string;
};

// A friend mini structure which stores the name and code of the friend
export type FriendMiniData = {
    id: string;
    name: string;
};

export type PuzzlenData = {
    id: string;
    name: string;
    geoLocation: geoLocationData;
    photoURL: string;
    difficulty: number;
};

export type geoLocationData = {
    latitude: number;
    longitude: number;
};

export type LeaderBoardData = {
    id: string;
    location?: geoLocationData;
    players: PlayData[];
};

export type PlayData = {
    puzzleId: string;
    LeaderBoardId: string;
    playerId: string;
    name: string;
    score: number;
};