'use client'

import { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import styles from '@/app/_styles/dashboardContainer.module.css';

export default function DashboardContainer(props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleClick() {
        //close sidebar when main element is clicked
        setSidebarOpen(false);
    }

    return (
        <div className={styles['dashboard-container']}>
            <Topbar setSidebarOpen={setSidebarOpen} setCurrUser={props.setCurrUser} />

            <div className={styles['main-container']}>
                {sidebarOpen && 
                    <aside>
                        <Sidebar setSidebarOpen={setSidebarOpen} />
                    </aside>
                }

                <main className={sidebarOpen ? styles['sidebar-open'] : undefined}
                    onClick={handleClick}
                >
                    {props.content}
                </main>
            </div>
        </div>
    );
}