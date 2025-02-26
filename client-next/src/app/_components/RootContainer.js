'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/_contexts/AuthContext';
import DashboardContainer from '@/app/_components/DashboardContainer';
import LandingContainer from '@/app/_components/LandingContainer';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function RootContainer({ dashboard, landing }) {
   const { isLoggedIn, setIsLoggedIn } = useAuth();

   useEffect(() => {
      async function getUserData() {
         try {
            var fetchOptions = {
               method: 'GET',
               headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('token')
               },
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            }
            var fetchURL = apiURL + '/members/curr-user';
      
            var res = await fetch(fetchURL, fetchOptions);
            
            setIsLoggedIn(res.ok);
         } catch (err) {
            console.error(err);
            setIsLoggedIn(false);
         }
      }
   
      getUserData();
   }, []);

   if (isLoggedIn === null) {
      return (
         <main style={
            { padding: '1rem', textAlign: 'center', fontSize: '1.5rem' }
         }>
            <p>Loading...</p>
         </main>
      );
   }
   
   return (
      <>
         { 
            isLoggedIn 
               ?
                  <DashboardContainer content={dashboard} />
               :
                  <LandingContainer content={landing} />
         }
      </>
   );
};