import NotFound from './NotFound';
import styles from '@/app/_styles/dashboardContainer.module.css';

export default function LandingContainer(props) {
   return (
      <div className={styles['landing-container']}>
         {props.content || <NotFound />}
      </div>
   );
}