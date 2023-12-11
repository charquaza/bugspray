import { cookies } from 'next/headers';
import { Source_Sans_3 } from 'next/font/google';
import { apiURL, apiSessionCookieName } from '@/root/config.js';
import DashboardContainer from '@/app/_components/DashboardContainer';
import ThemeRegistry from '@/app/_styles/ThemeRegistry';
import '@/app/_styles/globals.css';

export const metadata = {
   title: 'Bug Tracker',
   authors: [ { name: 'Jonathan Park' } ],
   description: 'Bug tracker created using create-next-app',
};

const sourceSans3 = Source_Sans_3({
   subsets: ['latin']
});

async function getUserData() {
   const cookieStore = cookies();
   const sessionCookie = cookieStore.get(apiSessionCookieName);

   if (!sessionCookie) {
      return false;
   }

   const sessionCookieValue = sessionCookie.value;
   
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
      <html lang="en-US" className={sourceSans3.className}>
         <ThemeRegistry options={{ key: 'mui' }}>
            <body>
               { 
                  isLoggedIn 
                     ?
                        <DashboardContainer content={dashboard} />
                     :
                        landing 
               }
            </body>
         </ThemeRegistry>
      </html>
   )
};
