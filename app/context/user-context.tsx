'use client';

import { supabase } from "@/lib/supabaseClient";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

/**
 * User interface representing authenticated user data
 */
export interface User {
    id: string;
    email: string;
}

/**
 * Context type for user authentication state
 */
interface UserContextType {    
    user: User | null;
}

/**
 * React Context for managing user authentication across the app
 */
const UserContext = createContext<UserContextType | null>(null);

/**
 * UserProvider Component
 * Provides user authentication state to all child components
 * Automatically fetches user data on mount using Supabase Auth
 * 
 * @param children - Child components that need access to user state
 */
export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    /**
     * Fetches current authenticated user from Supabase
     * Sets user state or null if not authenticated
     */
    const getUser = async () => {
        const {data, error} = await supabase.auth.getUser();
        if(error){
            console.log("Error fetching user:", error.message);
            setUser(null);
        } else {
            setUser(data.user as User);
        }
    }
    
    useEffect(() => {
        getUser();
    });
    
    return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Custom hook to access user authentication state
 * Must be used within a UserProvider component
 * 
 * @returns UserContextType containing user state
 * @throws Error if used outside UserProvider
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return ctx;
}