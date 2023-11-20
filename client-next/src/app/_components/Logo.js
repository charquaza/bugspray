import Image from 'next/image';
import logo from '@/root/public/mozilla-bug-emoji.png';
import styles from '@/app/_styles/logo.module.css';

export default function Logo() {
    return (
        <div className={styles['logo-container']}>
            <Image 
                src={logo} 
                alt='The app logo' 
                className={styles.logo} 
            />
        </div>
    );
}