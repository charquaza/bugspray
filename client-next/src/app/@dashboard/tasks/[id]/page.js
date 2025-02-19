'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { useUserData } from '@/app/_hooks/hooks';
import TaskUpdateForm from '@/app/_components/TaskUpdateForm';
import styles from '@/app/_styles/taskDetailsPage.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function TaskDetailsPage({ params }) {
   const taskId = use(params).id;
   
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
            const fetchURL = apiURL + '/tasks/' + taskId;

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
   }, [task, updateTask, taskId]);

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
      <main className={styles['task-details-page']}>
         {
            (task && user) &&
               <>
                  <h1>{task.title}</h1>

                  {
                     inUpdateMode 
                        ?
                           <TaskUpdateForm taskId={taskId} setInUpdateMode={setInUpdateMode} 
                              setUpdateTask={setUpdateTask}
                           />
                        :
                           <>
                              <ul className={styles['task-info']}>
                                 <li>
                                    <span className={styles['label']}>Title:</span> 
                                    <span className={styles['info']}>{task.title}</span>
                                 </li>
                                 <li className={styles['description-ctnr']}>
                                    <span className={styles['label']}>Description:</span> 
                                    <p className={styles['description']}>{task.description}</p>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Project:</span> 
                                    <span className={styles['info']}>
                                       <Link href={'/projects/' + task.project._id}>
                                          {task.project.name}
                                       </Link>
                                    </span>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Date Created:</span> 
                                    <span className={styles['info']}>
                                       {DateTime.fromISO(task.dateCreated).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                                    </span>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Created By:</span> 
                                    <span className={styles['info']}>
                                       <Link href={'/team/' + task.createdBy._id}>
                                          {task.createdBy.firstName + ' ' + task.createdBy.lastName}
                                       </Link>
                                    </span>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Status:</span> 
                                    <span className={styles['info']}>{task.status}</span>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Priority:</span> 
                                    <span className={styles['info']}>{task.priority}</span>
                                 </li>
                                 <li>
                                    <span className={styles['label']}>Sprint:</span> 
                                    <span className={styles['info']}>
                                       {task.sprint 
                                          ? <Link href={'/sprints/' + task.sprint._id}>{task.sprint.name}</Link> 
                                          : 'N/A'}
                                    </span>
                                 </li>
                                 <li className={styles['assignees-list-ctnr']}>
                                    <span className={styles['label']}>Assignees:</span> 
                                    <ul className={styles['assignees-list']}>
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
                              </ul>

                              <div>
                                 <button className={styles['edit-btn']} onClick={handleUpdateModeToggle}>Update Task</button>
                                    {(user.privilege === 'admin') && 
                                       <button className={styles['delete-btn']} onClick={handleTaskDelete}>Delete</button>
                                    }
                              </div>
                           </>
                  }
               </>
         }
      </main>
   );
};