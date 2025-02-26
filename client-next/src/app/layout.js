import { Source_Sans_3 } from 'next/font/google';
import { AuthProvider } from '@/app/_contexts/AuthContext';
import RootContainer from '@/app/_components/RootContainer';
import ThemeRegistry from '@/app/_styles/ThemeRegistry';
import '@/app/_styles/globals.css';

export const metadata = {
   title: 'Bugspray',
   authors: [ { name: 'Jonathan Park' } ],
   description: 'Bug tracker created using create-next-app',
};

const sourceSans3 = Source_Sans_3({
   subsets: ['latin']
});

export default async function RootLayout({ dashboard, landing, children }) {
   return (
      <html lang="en-US" className={sourceSans3.className}>
         <ThemeRegistry options={{ key: 'mui' }}>
            <body>
               <AuthProvider>
                  <RootContainer dashboard={dashboard} landing={landing} />
               </AuthProvider>
            </body>
         </ThemeRegistry>
      </html>
   );
};