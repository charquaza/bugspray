import Link from 'next/link';
import styles from '@/app/_styles/NotFound.module.css';

export default function NotFound() {
   return (
      <main className={styles['not-found-container']}>
         <h1>Sorry...</h1>
         <p>{"We couldn't find what you're looking for."}</p>
         <Link href='/'>Return Home</Link>
      </main>
   );
};