import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import ProjectsView from './ProjectsView';
import TasksView from './TasksView';
import TeamView from './TeamView';
import InboxView from './InboxView';
import NotificationsView from './NotificationsView';
import AccountView from './AccountView';
import NotFound from './NotFound';
import '../styles/Dashboard.css';

function Dashboard(props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    var view = useParams().view;

    var currViewComponent = (view === 'projects')
        ? <ProjectsView />
        : (view === 'tasks')
        ? <TasksView />
        : (view === 'team')
        ? <TeamView /> 
        : (view === 'inbox')
        ? <InboxView />
        : (view === 'notifications')
        ? <NotificationsView />
        : (view === 'account')
        ? <AccountView />
        : (view === undefined) 
        ? <HomeView />
        : <NotFound />;

    function handleClick() {
        //close sidebar when main element is clicked
        setSidebarOpen(false);
    }

    return (
        <div className='dashboard-container'>
            <Topbar setSidebarOpen={setSidebarOpen} setCurrUser={props.setCurrUser} />

            <div className='main-container'>
                {sidebarOpen && 
                    <aside>
                        <Sidebar />
                    </aside>
                }

                <main className={sidebarOpen ? 'sidebar-open' : undefined}
                    onClick={handleClick}
                >
                    {currViewComponent}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;