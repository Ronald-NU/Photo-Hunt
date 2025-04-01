import React, { createContext, useContext, useEffect, useState } from 'react';
import { CollectionUser, UserData } from '@/Firebase/DataStructures';
import { auth, db } from '@/Firebase/firebaseSetup';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface UserContextType {
    user: UserData | null;
    id: string;
  }
  
  const UserContext = createContext<UserContextType>({
    user: null,
    id: "",
  });
  
  export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [id, setID] = useState<string>("");
   
    useEffect(() => {
      const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser?.uid && !firebaseUser.isAnonymous) {
          const usersRef = collection(db, CollectionUser);
          const q = query(usersRef, where("uid", "==", firebaseUser.uid));
          const firestoreUnsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
              const doc = querySnapshot.docs[0];
              const userData = doc.data() as UserData;
    
              setUser({
                ...userData,
                mypuzzles: userData.mypuzzles || [],
              });
              setID(doc.id);
            } else {
              console.log("No user data found for uid:", firebaseUser.uid);
              setUser(null);
              setID("");
            }
          });
    
          return () => firestoreUnsubscribe();
        } else {
          setUser(null);
          setID("");
        }
      });
    
      return () => authUnsubscribe(); // Cleanup Auth listener
    }, []);
    
    
      return (
        <UserContext.Provider value={{ user, id }}>
          {children}
        </UserContext.Provider>
      );
    };
    
  export const useUser = () => useContext(UserContext);
    