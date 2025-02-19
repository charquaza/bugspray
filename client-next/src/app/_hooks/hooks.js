import { useState, useEffect } from 'react';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export function useUserData() {
   const [user, setUser] = useState();

   useEffect(() => {
      async function fetchUser() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            }
            const fetchURL = apiURL + '/members/curr-user';
      
            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               setUser(data.data);
            } else {
               throw new Error(data.errors[0]);
            }
         } catch (err) {
            throw err;
         }
      }

      fetchUser();
   }, []);

   return user;
};