'use client'

import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import NotFound from './NotFound';
import styles from '@/app/_styles/DashboardContainer.module.css';

export default function DashboardContainer(props) {
   const [sidebarOpen, setSidebarOpen] = useState(false);

   function handleClick() {
      //close sidebar when main element is clicked
      setSidebarOpen(false);
   }

   return (
      <LocalizationProvider dateAdapter={AdapterLuxon}>
         <div className={styles['dashboard-container']}>
            <Topbar setSidebarOpen={setSidebarOpen} setCurrUser={props.setCurrUser} />

            <div className={styles['main-container']}>
               {sidebarOpen && 
                  <aside>
                     <Sidebar setSidebarOpen={setSidebarOpen} />
                  </aside>
               }

               <div className={sidebarOpen ? styles['sidebar-open'] : undefined}
                  onClick={handleClick}
               >
                  {props.content || <NotFound />}
               </div>
            </div>
         </div>
      </LocalizationProvider>
   );
};