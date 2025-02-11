'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { DataGrid } from '@mui/x-data-grid';
import { useUserData } from '@/app/_hooks/hooks';
import { apiURL } from '@/root/config.js';

export default function MemberList({ updateMemberList, setUpdateMemberList }) {
   const user = useUserData();
   const [memberList, setMemberList] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getMemberList() {
      if (!user) {
         return;
      }
      if (memberList && !updateMemberList) {
         return;
      }

      async function fetchMemberList() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/members';

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const memberListData = data.data;

               //don't include self in list
               const filteredMemberList = memberListData.filter(
                  member => member._id !== user._id
               );
               
               if (setUpdateMemberList) {
                  setUpdateMemberList(false);
               }
               setMemberList(memberListData);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchMemberList();
   }, [ user, updateMemberList ]);

   var dataGridColumns = [
      { 
         field: 'name', headerName: 'Name', 
         flex: 1.2, minWidth: 150,
         renderCell: renderNameLink, 
         valueGetter: (value, row) => `${row.firstName} ${row.lastName}`
      },
      { 
         field: 'username', headerName: 'Username', 
         flex: 1, minWidth: 150
      },
      { 
         field: 'role', headerName: 'Role', 
         flex: 1.5, minWidth: 150
      },
      { 
         field: 'dateJoined', headerName: 'Date Joined', 
         flex: 0.2, minWidth: 140,
         valueFormatter: (value) => DateTime.fromISO(value).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      },
      { 
         field: 'privilege', headerName: 'Privilege', 
         flex: 0.1, minWidth: 85
      }
   ];

   var dataGridRows = (memberList) 
      ?
         memberList.map(member => member)
      : 
         [];
   
   function getRowId(row) {
      return row._id;
   }

   function renderNameLink(params) {
      return (
         <Link href={'/team/' + params.row._id}>
            {params.row.firstName + ' ' + params.row.lastName}
         </Link>
      );
   }

   return (
      memberList &&
         <div style={{ width: '100%' }}>
            <DataGrid
               getRowId={getRowId}
               rows={dataGridRows}
               columns={dataGridColumns}
               initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
               pageSizeOptions={[5,10,25,50,100]}
               checkboxSelection
               localeText={{ noRowsLabel: 'No members to display' }}
               sx={{
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: 'rgb(222, 244, 230)',
                    fontSize: '1.25em'
                  },
                  '& .MuiDataGrid-row': {
                     fontSize: '1.1em'
                  },
                  '& .MuiDataGrid-cell': {
                     overflow: 'scroll',
                     textOverflow: 'unset'
                  },
                  '& .MuiDataGrid-footerContainer': {
                     backgroundColor: 'rgb(229, 246, 235)'
                  }
               }}
            />
         </div>
   );
};