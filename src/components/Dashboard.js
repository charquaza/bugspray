import Topbar from './Topbar';
import '../styles/Dashboard.css';

function Dashboard() {
    return (
        //later: refactor Dashboard to be mounted as child of Home
        <div className='dashboard-container'>
            <Topbar />

            <p>Welcome to the dashboard!</p>
            <p>This page is currently under construction.</p>
        </div>
    );
}

export default Dashboard;