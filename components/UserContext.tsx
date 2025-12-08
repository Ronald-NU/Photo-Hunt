import React, { createContext, useContext, useEffect, useState } from 'react';
import { CollectionUser, UserData } from '@/Firebase/DataStructures';

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
      let authUnsubscribe: (() => void) | null = null;
      let firestoreUnsubscribe: (() => void) | null = null;
      let timer: NodeJS.Timeout;
      
      // Delay Firebase imports to ensure React Native is fully initialized
      const initUserContext = async () => {
        try {
          const { auth, db } = await import('@/Firebase/firebaseSetup');
          const { onAuthStateChanged } = await import('firebase/auth');
          const { collection, query, where, onSnapshot } = await import('firebase/firestore');
          
          authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser?.uid && !firebaseUser.isAnonymous) {
              const usersRef = collection(db, CollectionUser);
              try {
              const q = query(usersRef, where("uid", "==", firebaseUser?.uid));
              firestoreUnsubscribe = onSnapshot(q, (querySnapshot) => {
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
            } catch (error) {
              console.log("Error")
            }
            } else {
              setUser(null);
              setID("");
            }
          });
        } catch (error) {
          console.error("Error initializing UserContext:", error);
        }
      };
      
      // Add delay to ensure React Native runtime is ready
      timer = setTimeout(() => {
        initUserContext();
      }, 200);
      
      return () => {
        clearTimeout(timer);
        if (authUnsubscribe) {
          authUnsubscribe();
        }
        if (firestoreUnsubscribe) {
          firestoreUnsubscribe();
        }
      };
    }, []);
    
    
      return (
        <UserContext.Provider value={{ user, id }}>
          {children}
        </UserContext.Provider>
      );
    };
    
  export const useUser = () => useContext(UserContext);
    