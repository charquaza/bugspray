'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_contexts/AuthContext';
import styles from '@/app/_styles/DemoLoginButton.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

const demoCredentials = { 
   username: process.env.NEXT_PUBLIC_DEMO_USERNAME, 
   password: process.env.NEXT_PUBLIC_DEMO_PASSWORD 
};

export default function DemoLoginButton() {
   const { setIsLoggedIn } = useAuth();

   const router = useRouter();

   async function handleDemoLogin(e) {
      try {
         var fetchOptions = {
            method: 'POST',
            headers: {
               'Authorization': 'Bearer ' + localStorage.getItem('token'),
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(demoCredentials),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         }
         var fetchURL = apiURL + '/members/log-in';
   
         var res = await fetch(fetchURL, fetchOptions);
         var data = await res.json();
   
         if (res.ok) {
            //store auth token in localStorage
            localStorage.setItem('token', data.token);

            setIsLoggedIn(true);
            router.push('/');
         } else {
            console.error('Demo Login failed');
         }
      } catch (err) {
         console.error('Demo Login failed: ' + err);
      }
   }
   
   return (
      <button className={styles['demo-login-btn']} onClick={handleDemoLogin}>
         Try the Demo
      </button>
   );
};