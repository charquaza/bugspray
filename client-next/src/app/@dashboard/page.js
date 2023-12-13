'use client'

import { useUserData } from '@/app/_hooks/hooks';

export default function Home() {
   const user = useUserData();

   return (
      <main>
         {
            user && 
               <>
                  <p>Welcome, { user.username }.</p>
                  <p>This is the dashboard.</p>
               </>   
         }
      </main>
   );
}