import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/app/_components/Logo';
import styles from '@/app/_styles/landingPage.module.css';
import previewImage from '@/root/public/bugspray-cropped.png';

export default function LandingPage() {
   return (
      <div className={styles['landing-page']}>
         <header>
            <div className={styles['logo-brand-ctnr']}>
               <div className={styles['logo-ctnr']}>
                  <Logo />
               </div>
               <h1>Bugspray</h1>
            </div>

            <nav>
               <ul>
                  <li>
                     <Link href='/sign-up' className={styles['signup-link']}>
                        Sign Up
                     </Link>
                  </li>
                  <li>
                     <Link href='/log-in' className={styles['login-link']}>
                        Log In
                     </Link>
                  </li>
               </ul>
            </nav>
         </header>

         <main>
            <article>
               <h2>Manage Your Life.</h2>
               <p>Don't let the (bed) bugs bite!</p>
               <p>Plan, track, and achieve.</p>
               <p>Progress is built-in.</p>
   
               <Link href='/sign-up' className={styles['move-forward-link']}>
                  Let's Move Forward
               </Link>
            </article>

            <section>
               <div className={styles['app-preview-ctnr']}>
                  <Image 
                     src={previewImage}
                     alt='Preview of app dashboard showing Projects table'
                     quality={100}
                     sizes='80vw'
                  />
               </div>
            </section>
         </main>
      </div>
   );
};