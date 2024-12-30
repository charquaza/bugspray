import Image from 'next/image';
import logo from '@/root/public/mozilla-bug-emoji.png';
import styles from '@/app/_styles/Logo.module.css';

export default function Logo() {
    return (
        <Image 
            src={logo} 
            alt='The app logo - a green caterpillar' 
            className={styles.logo} 
        />
    );
};