'use client'

import styles from '@/app/_styles/errorPage.module.css';

export default function DashboardError({ error, reset }) {
   return (
      <main className={styles['error-page']}>
         <h1>Oops.</h1>
         <p>Something went wrong...</p>
         <p className={styles['hint']}>( A possibility: What you seek, may no longer be. )</p>
         <p>
            Error message:&nbsp;
            <span className={styles['error-msg']}>{error.message}</span>
         </p>
         <button onClick={() => reset()}>Click Here to Try Again</button>
      </main>
   );
};