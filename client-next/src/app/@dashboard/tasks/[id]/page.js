'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { useUserData } from '@/app/_hooks/hooks';
import TaskUpdateForm from '@/app/_components/TaskUpdateForm';
import { apiURL } from '@/root/config.js';

export default function TaskDetailsPage({ params }) {
   const user = useUserData();
   const [task, setTask] = useState();

   const [inUpdateMode, setInUpdateMode] = useState(false);

   const [updateTask, setUpdateTask] = useState(false);
   const [error, setError] = useState();

   const router = useRouter();

   if (error) {
      throw error;
   }

   useEffect(function getTask() {
      //only run on initial render and 
      //after each successful update call to api
      if (task && !updateTask) {
         return;
      }

      async function fetchTask() {
         try {
            const fetchOptions = {
               method: 'GET',
               mode:'cors',
               credentials: 'include',
               cache: 'no-store'
            };
            const fetchURL = apiURL + '/tasks/' + params.id;

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const taskData = data.data;
               setTask(taskData);
               setUpdateTask(false);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchTask();
   }, [task, updateTask, params.id]);

   function handleUpdateModeToggle() {
      setInUpdateMode(true);
   }

   async function handleTaskDelete(e) {
      try {
         const fetchOptions = {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            cache: 'no-store'
         };
         const fetchURL = apiURL + '/tasks/' + task._id;

         const res = await fetch(fetchURL, fetchOptions);
         const data = await res.json();

         if (res.ok) {
            router.push('/tasks');
         } else {
            const errors = data.errors;
            //construct new error using error message from server
            setError(new Error(errors[0]));
         }
      } catch (err) {
         setError(err);
      }
   }

   return (
      <main>
         {
            (task && user) &&
               <>
                  <h1>{task.title}</h1>

                  {
                     inUpdateMode 
                        ?
                           <TaskUpdateForm taskId={params.id} setInUpdateMode={setInUpdateMode} 
                              setUpdateTask={setUpdateTask}
                           />
                        :
                           <ul>
                              <li>Title: {task.title}</li>
                              <li>Description: {task.description}</li>
                              <li>Project:&nbsp;
                                 <Link href={'/projects/' + task.project._id}>
                                    {task.project.name}
                                 </Link>
                              </li>
                              <li>Date Created:&nbsp;
                                 {
                                    DateTime.fromISO(task.dateCreated).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                                 }
                              </li>
                              <li>Created By:&nbsp;
                                 <Link href={'/team/' + task.createdBy._id}>
                                    {
                                       task.createdBy.firstName + ' ' + 
                                       task.createdBy.lastName
                                    }
                                 </Link>
                              </li>
                              <li>Status: {task.status}</li>
                              <li>Priority: {task.priority}</li>
                              <li>Sprint:&nbsp;
                                 {
                                    task.sprint 
                                       ? <Link href={'/sprints/' + task.sprint._id}>{task.sprint.name}</Link> 
                                       : 'N/A'
                                 }
                              </li>
                              <li>
                                 Assignees: 
                                 <ul>
                                    {
                                       task.assignees.map((member) => {
                                          return (
                                             <li key={member._id}>
                                                <Link href={'/team/' + member._id}>
                                                   {member.firstName + ' ' + member.lastName}
                                                </Link>                                                
                                             </li>
                                          );
                                       })
                                    }
                                 </ul>
                              </li>

                              <br/>
                              <div>
                                 <button onClick={handleUpdateModeToggle}>Update Task</button>
                                 {
                                    (user.privilege === 'admin') && 
                                       <button onClick={handleTaskDelete}>Delete</button>
                                 }
                              </div>
                           </ul>
                  }
               </>
         }
      </main>
   );
};