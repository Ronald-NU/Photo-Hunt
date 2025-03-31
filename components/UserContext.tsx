import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserData } from '@/Firebase/DataStructures';
import { auth } from '@/Firebase/firebaseSetup';
import { getUserData } from '@/Firebase/firebaseHelperUsers';
import { onAuthStateChanged } from 'firebase/auth';

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
    const [id,setID] = useState<string>("");
   
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser && !firebaseUser.isAnonymous) {
          try {
            const userData = await getUserData(firebaseUser.uid);
            if (userData) {
              setUser(userData);
              setID(userData.id || "");
            } else {
              console.log("No user data found for uid:", firebaseUser.uid);
              setUser(null);
              setID("");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
            setID("");
          }
        } else {
          setUser(null);
          setID("");
        }
      });

      return () => unsubscribe();
    }, []);
    
      return (
        <UserContext.Provider value={{ user, id }}>
          {children}
        </UserContext.Provider>
      );
    };
    
  export const useUser = () => useContext(UserContext);
    