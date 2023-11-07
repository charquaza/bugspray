'use client'

import { useRouter } from 'next/navigation';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';

export default function Home() {
   const user = useUserData();

   const router = useRouter();

   async function handleLogOut() {
      try {
         const fetchOptions = {
            method: 'POST',
            mode: 'cors',
            credentials: 'include'
         }
         const fetchURL = apiURL + '/members/log-out';
   
         const res = await fetch(fetchURL, fetchOptions);
   
         if (res.ok) {
            router.refresh();
         } else {
            const data = await res.json();
            const errors = data.errors;
            throw Error('Logout unsuccessful: ' + errors[0]);
         }   
      } catch (err) {
         throw err;
      }
   }

   return (
      <main>
         {
            user && 
               <>
                  <p>Welcome, { user.username }.</p>
                  <p>This is the dashboard.</p>
                  <button onClick={handleLogOut}>Log Out</button>
               </>   
         }
      </main>
   );
}