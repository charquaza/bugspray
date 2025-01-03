import styles from '@/app/_styles/loadingPage.module.css';

export default function Loading() {
   return (
       <main className={styles['loading-container']}>
           <p>Loading...</p>
       </main>
   );
};