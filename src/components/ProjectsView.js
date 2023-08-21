import { DataGrid } from '@mui/x-data-grid';

function ProjectsView() {
    var columns = [
        { field: 'project', headerName: 'Project', width: 150 },
        { field: 'dateCreated', headerName: 'Date Created', width: 110 },
        { field: 'status', headerName: 'Status', width: 70 },
        { field: 'priority', headerName: 'Priority', width: 80 },
        { field: 'lead', headerName: 'Lead', width: 100 },
        { field: 'team', headerName: 'Team', width: 100 },
        { field: 'tasks', headerName: 'Tasks', width: 200 },
    ];
      
    var rows = [
        {
            id: 0, project: 'Bug Tracker', dateCreated: '12/6/21', status: 'Open', 
            priority: 'High', lead: 'Jonathan', team: 'Jonathan, Robert, May',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 1, project: 'Portfolio', dateCreated: '1/6/21', status: 'Open', 
            priority: 'Low', lead: 'Jonathan', team: 'Jonathan',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 2, project: 'Weather App', dateCreated: '3/1/22', status: 'Open', 
            priority: 'Medium', lead: 'Jonathan', team: 'Jonathan, Robert, May',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 3, project: 'Work Order System', dateCreated: '4/23/22', status: 'Open', 
            priority: 'Medium', lead: 'Max', team: 'Max, Robert, Ivy',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 4, project: 'Geolocator', dateCreated: '12/10/21', status: 'Open', 
            priority: 'Medium', lead: 'Ivy', team: 'Ivy, Robert, May',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 5, project: 'Payroll', dateCreated: '7/15/19', status: 'Closed', 
            priority: 'Closed', lead: 'Jonathan', team: 'Jonathan, Max, May',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 6, project: 'FireBirds', dateCreated: '8/30/19', status: 'Closed', 
            priority: 'Closed', lead: 'Sean', team: 'Sean, Justin, William',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
        {
            id: 5, project: 'Employee Database', dateCreated: '7/15/19', status: 'Closed', 
            priority: 'Closed', lead: 'Jonathan', team: 'Jonathan, Max, May',  
            tasks: 'Task 1, Task 2, Task 3, ...'
        },
    ];

    return (
        <div className='projects-view'>
            <h1>Projects</h1>

            <div style={{ height: 400, width: '100%' }}>
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

export default ProjectsView;