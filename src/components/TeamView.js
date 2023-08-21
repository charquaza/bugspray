import { DataGrid } from '@mui/x-data-grid';

function TeamView() {
    var columns = [
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'dateJoined', headerName: 'Date Joined', width: 110 },
        { field: 'status', headerName: 'Status', width: 80 },
        { field: 'projects', headerName: 'Projects', width: 150 },
        { field: 'tasks', headerName: 'Tasks', width: 200 },
    ];
      
    var rows = [
        {
            id: 0, name: 'Jonathan', dateJoined: '1/1/19', status: 'Online', 
            projects: 'Bug Tracker, Portfolio, Weather App, Payroll, Employee Database',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 1, name: 'Ivy', dateJoined: '12/1/21', status: 'Online', 
            projects: 'Work Order Ssstem, Geolocator',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 2, name: 'Robert', dateJoined: '1/1/19', status: 'Offline', 
            projects: 'Bug Tracker, Portfolio, Weather App, Payroll, Employee Database',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 3, name: 'May', dateJoined: '2/3/20', status: 'Busy', 
            projects: 'Bug Tracker, Portfolio, Weather App, Payroll, Employee Database',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 4, name: 'Jonathan', dateJoined: '1/1/19', status: 'Online', 
            projects: 'Bug Tracker, Portfolio, Weather App, Payroll, Employee Database',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 5, name: 'Jonathan', dateJoined: '1/1/19', status: 'Online', 
            projects: 'Bug Tracker, Portfolio, Weather App, Payroll, Employee Database',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
    ];

    return (
        <div className='team-view'>
            <h1>Team</h1>

            <div>
                <DataGrid 
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                />
            </div>
        </div>
    );
}

export default TeamView;