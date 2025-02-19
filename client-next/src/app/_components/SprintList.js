'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DataGrid } from '@mui/x-data-grid';
import { apiURL } from '@/root/config.js';
import styles from '@/app/_styles/SprintList.module.css';

export default function SprintList({ projectId, updateSprintList, setUpdateSprintList }) {
   const [sprintList, setSprintList] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getSprintList() {
      if (sprintList && !updateSprintList) {
         return;
      }

      async function fetchSprintList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };

            const queryParams = new URLSearchParams({ projectId });
            const fetchURL = apiURL + '/sprints?' + queryParams;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const sprintListData = data.data;
               setSprintList(sprintListData);

               if (sprintList && setUpdateSprintList) {
                  setUpdateSprintList(false);
               }
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchSprintList();
   }, [projectId, sprintList, updateSprintList, setUpdateSprintList]);

   var dataGridColumns = [
      { field: 'name', headerName: 'Name', flex: 2, minWidth: 150, 
         renderCell: renderNameLink, valueGetter: (value) => value
      },
      { field: 'description', headerName: 'Description', flex: 4, minWidth: 150,
         cellClassName: styles['description-cell']
      },
      { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 140,
         valueFormatter: (value) => DateTime.fromISO(value).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      },
      { field: 'endDate', headerName: 'End Date', flex: 1, minWidth: 140,
         valueFormatter: (value) => DateTime.fromISO(value).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      }
   ];

   var dataGridRows = (sprintList) 
      ?
         sprintList.map(sprint => sprint)
      : 
         [];

   function getRowId(row) {
      return row._id;
   }

   function renderNameLink(params) {
      return (
         <Link href={'/sprints/' + params.row._id}>{params.row.name}</Link>
      );
   }

   function getRowHeight(params) {
      const descriptionLength = params.model.description.length;

      if (descriptionLength <= 50) {
         return 45;
      } else if (descriptionLength <= 100) {
         return 65;
      } else if (descriptionLength <= 150) {
         return 85;
      } else {
         return 110;
      }
   }

   return (
      sprintList &&
         <div style={{ width: '100%' }} className={styles['sprint-list-ctnr']}>
            <DataGrid
               getRowId={getRowId}
               rows={dataGridRows}
               columns={dataGridColumns}
               columnHeaderHeight={50}
               getRowHeight={getRowHeight}
               initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
               pageSizeOptions={[5,10,25,50,100]}
               checkboxSelection
               localeText={{ noRowsLabel: 'No sprints to display' }}
               sx={{
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: 'rgb(222, 244, 230)',
                    fontSize: '1.2em'
                  },
                  '& .MuiDataGrid-row': {
                     fontSize: '1.1em'
                  },
                  '& .MuiDataGrid-cell': {
                     overflow: 'scroll',
                     textOverflow: 'unset'
                  },
                  '& .MuiDataGrid-footerContainer': {
                     backgroundColor: 'rgb(229, 246, 235)',
                  }
               }}
            />
         </div>
   );
};