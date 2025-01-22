'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '@/root/config.js';
import HomeProjectCard from '@/app/_components/HomeProjectCard';
import styles from '@/app/_styles/homePage.module.css';

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
               //limit to 6 projects
               setProjectList(projectListData.slice(0, 6));
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
      <main className={styles['home-container']}>
         {
            projectList &&
               <>
                  <h1>Your Work, in Progress</h1>

                  <div className={styles['card-list-container']}>
                     {
                        projectList.map(project => {
                           return <HomeProjectCard project={project} key={project._id} />;
                        })
                     }
                  </div>               
               </>   
         }
      </main>
   );
};