'use client'

import { useState, useEffect } from 'react';
import { apiURL } from '../../../../../config.js';

export default function ProjectDetailsPage({ params }) {
   const [project, setProject] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(() => {
      async function getProject() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode: 'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/projects/' + params.id;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const projectData = data.data;
               setProject(projectData);
            } else {
               const errors = data.errors;
               setError(errors);
            }
         } catch (err) {
            setError(error);
         }
      }

      getProject();
   }, []);

   return (
      <main>
         { 
            project && 
               <>
                  <h1>{project.name}</h1>
                  <p>This is the project detail page.</p>

                  <ul>
                     <li>Name: {project.name}</li>
                     <li>Date Created: {project.dateCreated}</li>
                     <li>Status: {project.status}</li>
                     <li>Priority: {project.priority}</li>
                     <li>Lead: {
                           project.lead.firstName + ' ' +
                           project.lead.lastName
                        }
                     </li>
                     <li>
                        Team Members: 
                        <ul>
                           {
                              project.team.map((member) => {
                                 return (
                                    <li key={member._id}>
                                       {member.firstName + ' ' + member.lastName}
                                    </li>
                                 );
                              })
                           }
                        </ul>
                     </li>
                  </ul>
               </>
         }
      </main>
   );
}