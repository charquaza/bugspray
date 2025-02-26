'use client'

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
   const [isLoggedIn, setIsLoggedIn] = useState(null);

   return (
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   return useContext(AuthContext);
}
