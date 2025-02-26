'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DataGrid } from '@mui/x-data-grid';
import sortingComparators from '../_utils/sortingComparators';
import styles from '@/app/_styles/TaskList.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function TaskList({ 
   projectId, selectColumns, initialPageSize, filterByStatus,
   updateTaskList, setUpdateTaskList
}) {
   const [taskList, setTaskList] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getTaskList() {
      if (taskList && !updateTaskList) {
         return;
      }

      async function fetchTaskList() {
         try {
            const fetchOptions = {
               method: 'GET',
               headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('token')
               },
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

               if (taskList && setUpdateTaskList) {
                  setUpdateTaskList(false);
               }
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchTaskList();
   }, [projectId, filterByStatus, taskList, updateTaskList, setUpdateTaskList]);

   var dataGridColumns = [
      { field: 'title', headerName: 'Title', flex: 0.7, minWidth: 200, 
         cellClassName: styles['cell'],
         renderCell: renderTask, valueGetter: (value) => value 
      },
      { field: 'description', headerName: 'Description', flex: 1, minWidth: 150,
         cellClassName: styles['description-cell']
      },
      { field: 'project', headerName: 'Project', flex: 0.4, minWidth: 150, 
         cellClassName: styles['cell'],
         renderCell: renderProject, valueGetter: (value) => value 
      },
      { field: 'status', headerName: 'Status', minWidth: 100,
         cellClassName: styles['cell'],
         sortComparator: sortingComparators.status
      },
      { field: 'priority', headerName: 'Priority', minWidth: 80,
         cellClassName: styles['cell'],
         sortComparator: sortingComparators.priority
      },
      { field: 'dateCreated', headerName: 'Date Created', minWidth: 110,
         cellClassName: styles['cell'],
         valueFormatter: (value) => DateTime.fromISO(value).toLocaleString(DateTime.DATE_MED)
      },
      // { field: 'createdBy', headerName: 'Created By', minWidth: 65, 
      //    renderCell: renderMember, valueGetter: (value) => value 
      // },
      { field: 'sprint', headerName: 'Sprint', flex: 0.1, minWidth: 100, 
         cellClassName: styles['cell'],
         renderCell: renderSprint, valueGetter: (value) => value 
      },
      { field: 'assignees', headerName: 'Assignees', flex: 0.3, minWidth: 150,
         cellClassName: styles['assignees-cell'],
         renderCell: renderAssignees, valueGetter: (value) => value
      }
   ];

   if (selectColumns) {
      dataGridColumns = dataGridColumns.filter(column => {
         return selectColumns.includes(column.field);
      });
   }

   var dataGridRows = (taskList) 
      ?
         taskList.map(task => task)
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

   function getRowHeight(params) {
      const titleLength = params.model.title.length;
      const descriptionLength = params.model.description.length;
      const assigneesLength = params.model.assignees.length;

      const numOfRows = Math.max(
         Math.ceil( titleLength / 26 ), 
         Math.ceil( descriptionLength / 40 ), 
         assigneesLength
      );

      if (numOfRows <= 1) {
         return 45;
      } else if (numOfRows <= 2) {
         return 65;
      } else if (numOfRows <= 3) {
         return 85;
      } else {
         return 110;
      }
   }

   return (
      taskList &&
         <div className={styles['task-list-ctnr']}>
            <DataGrid
               getRowId={getRowId}
               rows={dataGridRows}
               columns={dataGridColumns}
               columnHeaderHeight={55}
               getRowHeight={getRowHeight}
               initialState={{
                  pagination: { paginationModel: { pageSize: initialPageSize || 25 } },
                }}
               pageSizeOptions={[5,10,25,50,100]}
               checkboxSelection
               localeText={{ noRowsLabel: 'No tasks to display' }}
               sx={{
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: 'rgb(222, 244, 230)',
                    fontSize: '1.2em'
                  },
                  '& .MuiDataGrid-row': {
                     fontSize: '1.1em'
                  },
                  '& .MuiDataGrid-footerContainer': {
                     backgroundColor: 'rgb(229, 246, 235)',
                  }
               }}
            />
         </div>
   );
};