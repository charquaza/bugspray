'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DataGrid } from '@mui/x-data-grid';
import { apiURL } from '@/root/config.js';

export default function SprintList({ projectId }) {
   const [sprintList, setSprintList] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getSprintList() {
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
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchSprintList();
   }, [projectId]);

   var dataGridColumns = [
      { field: 'name', headerName: 'Name', width: 200, renderCell: renderSprint },
      { field: 'description', headerName: 'Description', width: 120 },
      { field: 'startDate', headerName: 'Start Date', width: 150 },
      { field: 'endDate', headerName: 'End Date', width: 150 }
   ];

   var dataGridRows = (sprintList) 
      ?
         sprintList.map(sprint => {
            return ({
               ...sprint,
               startDate: DateTime.fromISO(sprint.startDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
               endDate: DateTime.fromISO(sprint.endDate).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
            });
         })
      : 
         [];

   function getRowId(row) {
      return row._id;
   }

   function renderSprint(params) {
      return (
         <Link href={'/sprints/' + params.row._id}>{params.row.name}</Link>
      );
   }

   return (
      sprintList &&
         <div style={{ width: '100%' }}>
            <DataGrid
               getRowId={getRowId}
               rows={dataGridRows}
               columns={dataGridColumns}
               autoHeight
               initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
               pageSizeOptions={[5,10,25,50,100]}
               checkboxSelection
               localeText={{ noRowsLabel: 'No sprints to display' }}
            />
         </div>
   );
}