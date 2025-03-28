import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { CollectionRequests, FriendRequest, STATUS, UserData } from "./DataStructures";
import { db } from "./firebaseSetup";
import { updateUserDocument } from "./firebaseHelperUsers";
import { useUser } from "@/components/UserContext";
const {id} = useUser();

//querys the database by friend code to get the user's uid
export const sendFriendRequest = async (code: string,user:UserData) => {
    try {
        const request:FriendRequest = {
            friendCode: code,
            requesterCode: user.code,
            name: user.name,
            status: "PENDING"
        };
        await addDoc(collection(db,CollectionRequests),request)
    } catch (e) {
        return e;
    }
}

//querys the database by friend code to get the user's uid
export const acceptDenyFriend = async (id:string, request:FriendRequest, status:STATUS, user:UserData) => {
    try {
        if(status === 'ACCEPTED'){
            user.friends = [{
                id:request.friendCode,
                name:request.name}
                , ...user.friends]
           await updateUserDocument(id, user);
            request.status = status;
            if(user?.name){
            request.name = user?.name;
            }
            updateDoc(doc(collection(db,CollectionRequests),id),request);    
        } 
        if(status === 'REJECTED'){
            request.status = status;
            updateDoc(doc(collection(db,CollectionRequests),id),request);
        }

        return null;
    } catch (e) {
        return e;
    }
}

//querys the database by myfriend code to get all pending requests
export const getFriendRequest = async (code: string, user:UserData) => {
    try {
        const querySnapshot = await getDocs(collection(db, CollectionRequests));
        const request: FriendRequest[] = []; 
        const myRequest: FriendRequest[] = [];
        querySnapshot.forEach(async (doc) => {
            if (doc.data().friendCode === code && doc.data().status === 'PENDING') {
                request.push(doc.data() as FriendRequest);
            }
            if (doc.data().requesterCode === code && doc.data().status === 'PENDING') {
                myRequest.push(doc.data() as FriendRequest);
            }
            if (doc.data().requesterCode === code && doc.data().status === 'ACCEPTED') {
                user.friends = [{
                    id:doc.data().friendCode as string,
                    name:doc.data().name}
                    , ...user.friends]
               await updateUserDocument(id, user);
                deleteDoc(doc.ref);
            }
            if (doc.data().requesterCode === code && doc.data().status === 'REJECTED') {
                deleteDoc(doc.ref);
            }
        });
        return [request, myRequest];
    } catch (e) {
        return e;
    }
}