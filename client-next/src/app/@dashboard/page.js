'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '@/root/config.js';
import DashProjectCard from '@/app/_components/DashProjectCard';

export default function Home() {
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

   return (
      <main>
         {
            projectList &&
               <>
                  <h1>Your Work, in Progress</h1>

                  {
                     projectList.map(project => {
                        return <DashProjectCard project={project} key={project._id} />;
                     })
                  }
               </>   
         }
      </main>
   );
};