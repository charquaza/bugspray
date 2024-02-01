'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DataGrid } from '@mui/x-data-grid';
import { apiURL } from '@/root/config.js';

export default function TaskList({ 
   projectId, selectColumns, initialPageSize, filterByStatus 
}) {
   const [taskList, setTaskList] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getTaskList() {
      async function fetchTaskList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = (projectId) 
               ? apiURL + '/tasks' + '?projectId=' + projectId
               : apiURL + '/tasks';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               let taskListData = data.data;
               
               if (filterByStatus) {
                  taskListData = taskListData.filter(task => {
                     return filterByStatus.includes(task.status);
                  });
               }

               setTaskList(taskListData);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchTaskList();
   }, [projectId, filterByStatus]);

   var dataGridColumns = [
      { field: 'title', headerName: 'Title', width: 200, renderCell: renderTask },
      { field: 'description', headerName: 'Description', width: 120 },
      { field: 'project', headerName: 'Project', width: 120, renderCell: renderProject },
      { field: 'status', headerName: 'Status', width: 120 },
      { field: 'priority', headerName: 'Priority', width: 100 },
      { field: 'dateCreated', headerName: 'Date Created', width: 150 },
      { field: 'createdBy', headerName: 'Created By', width: 120, renderCell: renderMember },
      { field: 'sprint', headerName: 'Sprint', width: 60, renderCell: renderSprint },
      { field: 'assignees', headerName: 'Assignees', width: 200, renderCell: renderAssignees },
   ];
   if (selectColumns) {
      dataGridColumns = dataGridColumns.filter(column => {
         return selectColumns.includes(column.field);
      });
   }

   var dataGridRows = (taskList) 
      ?
         taskList.map(task => {
            return ({
               ...task,
               dateCreated: DateTime.fromISO(task.dateCreated).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
            });
         })
      : 
         [];
   
   function getRowId(row) {
      return row._id;
   }

   function renderTask(params) {
      return (
         <Link href={'/tasks/' + params.row._id}>{params.row.title}</Link>
      );
   }

   function renderProject(params) {
      return (
         <Link href={'/projects/' + params.row.project._id}>{params.row.project.name}</Link>
      );
   }

   function renderMember(params) {
      return (
         <Link href={'/team/' + params.row.createdBy._id}>
            {params.row.createdBy.firstName + ' ' + params.row.createdBy.lastName}
         </Link>
      );
   }

   function renderSprint(params) {
      return (
         params.row.sprint 
            ?
               <Link href={'/sprints/' + params.row.sprint._id}>
                  {params.row.sprint.name}
               </Link>
            :
               'N/A'
      );
   } 

   function renderAssignees(params) {
      return (
         <ul>
            {
               params.row.assignees.map(assignee => {
                  return (
                     <li key={assignee._id}>
                        <Link href={'/team/' + assignee._id}>
                           {assignee.firstName + ' ' + assignee.lastName}
                        </Link>
                     </li>
                  )
               })
            }
         </ul>
      );
   }

   return (
      taskList &&
         <div style={{ width: '100%' }}>
            <DataGrid
               getRowId={getRowId}
               rows={dataGridRows}
               columns={dataGridColumns}
               autoHeight
               initialState={{
                  pagination: { paginationModel: { pageSize: initialPageSize || 25 } },
                }}
               pageSizeOptions={[5,10,25,50,100]}
               checkboxSelection
               localeText={{ noRowsLabel: 'No tasks to display' }}
            />
         </div>
   );
};