import { DataGrid } from '@mui/x-data-grid';

function TasksView() {
    var columns = [
        { field: 'bug', headerName: 'Bug', width: 200 },
        { field: 'project', headerName: 'Project', width: 150 },
        { field: 'status', headerName: 'Status', width: 70 },
        { field: 'reporter', headerName: 'Reporter', width: 100 },
        { field: 'created', headerName: 'Created', width: 100 },
        { field: 'priority', headerName: 'Priority', width: 100 },
        { field: 'assignees', headerName: 'Assignees', width: 100 },
        // {
        //     field: 'age',
        //     headerName: 'Age',
        //     type: 'number',
        //     width: 90,
        // },
        // {
        //     field: 'fullName',
        //     headerName: 'Full name',
        //     description: 'This column has a value getter and is not sortable.',
        //     sortable: false,
        //     width: 160,
        //     valueGetter: (params) =>
        //     `${params.getValue(params.id, 'firstName') || ''} ${
        //         params.getValue(params.id, 'lastName') || ''
        //     }`,
        // },
    ];
      
    var rows = [
        {
            id: 0, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 1, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 2, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 3, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 4, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 5, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 6, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 7, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
        {
            id: 8, bug: 'Customize table view', project: 'Bug Tracker', status: 'Open', 
            reporter: 'Jonathan', created: '12/6/21', priority: 'Medium', 
            assignees: 'Jonathan'
        },
    ];

    return (
        <div className='tasks-view'>
            <h1>Tasks</h1>

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

export default TasksView;