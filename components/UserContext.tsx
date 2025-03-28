import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserData } from '@/Firebase/DataStructures';
import { auth } from '@/Firebase/firebaseSetup';
import { getUserData } from '@/Firebase/firebaseHelperUsers';

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
    const firebaseUser = auth.currentUser;
    const setUserData =  async () => {
        if (firebaseUser) {
            if(auth.currentUser?.isAnonymous){
                setUser(null);
            } else {
                const data = await getUserData(firebaseUser.uid);
                if(data?.exists){
                setUser(data.data() as UserData);
                setID(data.id);
                }
            }
        }
       }
      setUserData();
      },[auth.currentUser]);
    
      return (
        <UserContext.Provider value={{ user, id }}>
          {children}
        </UserContext.Provider>
      );
    };
    
    export const useUser = () => useContext(UserContext);
    