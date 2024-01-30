'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DataGrid } from '@mui/x-data-grid';
import { apiURL } from '@/root/config.js';

export default function ProjectList() {
   const [projectList, setProjectList] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getProjectList() {
      async function fetchProjectList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/projects';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const projectListData = data.data;   
               setProjectList(projectListData);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchProjectList();
   }, []);

   var dataGridColumns = [
      { field: 'name', headerName: 'Project', width: 200, renderCell: renderNameLink },
      { field: 'status', headerName: 'Status', width: 120 },
      { field: 'priority', headerName: 'Priority', width: 100 },
      { field: 'dateCreated', headerName: 'Date Created', width: 150 },
      { field: 'lead', headerName: 'Lead', width: 200, renderCell: renderLeadLink },
   ];

   var dataGridRows = (projectList) 
      ?
         projectList.map(project => {
            return ({
               ...project,
               dateCreated: DateTime.fromISO(project.dateCreated).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
            });
         })
      : 
         [];
   
   function getRowId(row) {
      return row._id;
   }

   function renderNameLink(params) {
      return (
         <Link href={'/projects/' + params.row._id}>{params.row.name}</Link>
      );
   }

   function renderLeadLink(params) {
      return (
         <Link href={'/team/' + params.row.lead._id}>
            {params.row.lead.firstName + ' ' + params.row.lead.lastName}
         </Link>
      );
   }      

   return (
      <section>
         {
            projectList &&
               <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                     getRowId={getRowId}
                     rows={dataGridRows}
                     columns={dataGridColumns}
                     pageSize={5}
                     rowsPerPageOptions={[5]}
                     checkboxSelection
                     localeText={{ noRowsLabel: 'No projects to display' }}
                  />
               </div>
         }
      </section>
   );
}