import { cookies } from 'next/headers';
import { apiURL, apiSessionCookieName } from '../../config.js';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
   title: 'Bug Tracker',
   authors: [ { name: 'Jonathan Park' } ],
   description: 'Bug tracker created using create-next-app',
};

async function getUserData() {
   const cookieStore = cookies();
   const sessionCookieValue = cookieStore.get(apiSessionCookieName).value;
   
   try {
      var fetchOptions = {
         method: 'GET',
         headers: {
            'Cookie': apiSessionCookieName + '=' + sessionCookieValue
         },
         mode: 'cors',
         credentials: 'include',
         cache: 'no-store'
      }
      var fetchURL = apiURL + '/members/curr-user';

      var res = await fetch(fetchURL, fetchOptions);
      var data = await res.json();
      
      return res.ok;    
   } catch (err) {
      console.error(err);
      return false;
   }
}

export default async function RootLayout({ dashboard, landing, children }) {
   var isLoggedIn = await getUserData();

   return (
      <html lang="en-US">
         <body>
            { 
               isLoggedIn 
                  ?
                     <>
                        <nav>
                           <ul>
                              <li><Link href='/'>Home</Link></li>
                              <li><Link href='/projects'>Projects</Link></li>
                              <li><Link href='/tasks'>Tasks</Link></li>
                              <li><Link href='/team'>Team</Link></li>
                              <li><Link href='/inbox'>Inbox</Link></li>
                              <li><Link href='/notifications'>Notifications</Link></li>
                              <li><Link href='/account'>Account</Link></li>
                           </ul>
                        </nav> 
                        {dashboard}
                     </>
                  :
                  landing 
            }
         </body>
      </html>
   )
};
