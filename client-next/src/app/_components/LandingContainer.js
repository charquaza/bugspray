import { cloneElement } from 'react';
import NotFound from './NotFound';
import styles from '@/app/_styles/DashboardContainer.module.css';

export default function LandingContainer(props) {
   return (
      <div className={styles['landing-container']}>
         {props.content 
            ? props.content
            : <NotFound />
         }
      </div>
   );
};