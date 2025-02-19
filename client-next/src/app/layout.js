import { cookies } from 'next/headers';
import { Source_Sans_3 } from 'next/font/google';
import DashboardContainer from '@/app/_components/DashboardContainer';
import LandingContainer from '@/app/_components/LandingContainer';
import ThemeRegistry from '@/app/_styles/ThemeRegistry';
import '@/app/_styles/globals.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;
const apiSessionCookieName = process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME;

export const metadata = {
   title: 'Bugspray',
   authors: [ { name: 'Jonathan Park' } ],
   description: 'Bug tracker created using create-next-app',
};

const sourceSans3 = Source_Sans_3({
   subsets: ['latin']
});

async function getUserData() {
   const cookieStore = await cookies();
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
                        <LandingContainer content={landing} />
               }
            </body>
         </ThemeRegistry>
      </html>
   );
};