import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserData } from '@/Firebase/DataStructures';
import { auth } from '@/Firebase/firebaseSetup';
import { getUserData } from '@/Firebase/firebaseHelperUsers';

interface UserContextType {
    user: UserData | null;
    loading: boolean;
    id: string,
    setLoading:(value:boolean)=>void
  }
  
  const UserContext = createContext<UserContextType>({
    user: null,
    id:"",
    loading: true,
    setLoading:(value:boolean)=>{}
  });
  
  export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [id,setID] = useState<string>("");
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
    const firebaseUser = auth.currentUser;
    const setUserData =  async () => {
        if (firebaseUser) {
            if(auth.currentUser?.isAnonymous){
                setUser(null);
                setLoading(false);
            } else {
                const data = await getUserData(firebaseUser.uid);
                if(data?.exists){
                setUser(data.data() as UserData);
                setID(data.id);
                setLoading(false);
                }
            }
        }
       }
      setUserData();
      },[auth]);
    
      return (
        <UserContext.Provider value={{ user, id, loading, setLoading }}>
          {children}
        </UserContext.Provider>
      );
    };
    
    export const useUser = () => useContext(UserContext);
    