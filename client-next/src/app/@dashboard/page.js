'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiURL } from '../../../config.js';

export default function Home() {
    const [logoutRequested, setLogoutRequested] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!logoutRequested) {
            return;
        }

        async function logOut() {
            try {
                var fetchOptions = {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include'
                }
                var fetchURL = apiURL + '/members/log-out';
        
                var res = await fetch(fetchURL, fetchOptions);
        
                if (res.ok) {
                    console.log('logout success');
                    router.refresh();
                } else {
                    console.error('Logout unsuccessful: ' + err);
                }    
            } catch (err) {
                console.error('Logout unsuccessful: ' + err);
            }

            setLogoutRequested(false);
        }

        logOut();
    }, [logoutRequested]);

    function handleLogOut() {
        setLogoutRequested(true);
    }

    return (
        <main>
            <p>You are logged in. This is the dashboard.</p>
            <button onClick={handleLogOut}>Log Out</button>
        </main>
    );
}