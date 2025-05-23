'use client'

import { useState, useEffect } from 'react';
import HomeProjectCard from '@/app/_components/HomeProjectCard';
import styles from '@/app/_styles/homePage.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

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
               headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('token')
               },
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
                     {projectList.length > 0
                        ?
                           projectList.map(project => {
                              return <HomeProjectCard project={project} key={project._id} />;
                           })
                        :
                           <>
                              <p>
                                 You are not involved in any projects.
                                 <br/>
                                 If applicable, contact your team to be added to a project(s).
                              </p>
                           </>
                     }
                  </div>
               </>
         }
      </main>
   );
};