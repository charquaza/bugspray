import { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../styles/Dashboard.css';

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleClick() {
        //close sidebar if main element is clicked
        setSidebarOpen(false);
    }

    return (
        //later: refactor Dashboard to be mounted as child of Home
        <div className='dashboard-container'>
            <Topbar setSidebarOpen={setSidebarOpen} />

            <div className='main-container'>
                {sidebarOpen && 
                    <aside>
                        <Sidebar />
                    </aside>
                }

                <main className={sidebarOpen ? 'sidebarOpen' : undefined}
                    onClick={handleClick}
                >
                    <p>Welcome to the dashboard!</p>
                    <p>This page is currently under construction.</p>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;