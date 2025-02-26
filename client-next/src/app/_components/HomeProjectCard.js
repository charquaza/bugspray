'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TaskList from '@/app/_components/TaskList';
import styles from '@/app/_styles/HomeProjectCard.module.css';

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function HomeProjectCard({ project }) {
   const [taskList, setTaskList] = useState();
   const [error, setError] = useState();

   if (error) {
      throw error;
   }

   useEffect(function getTaskList() {
      async function fetchTaskList() {
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
            const fetchURL = apiURL + '/tasks' + '?projectId=' + project._id

            const res = await fetch(fetchURL, fetchOptions);
            const data = await res.json();

            if (res.ok) {
               const taskListData = data.data; 
               setTaskList(taskListData);
            } else {
               const errors = data.errors;
               setError(new Error(errors[0]));
            }
         } catch (err) {
            setError(err);
         }
      }

      fetchTaskList();
   }, [project._id]);

   let completedTaskCount = 0; 
   if (taskList) {
      taskList.forEach(task => {
         if (task.status === 'Complete' || task.status === 'Closed') {
            completedTaskCount++;
         }
      });
   }

   return (
      <article className={styles['card-container']}>
         <h2><Link href={'/projects/' + project._id}>{project.name}</Link></h2>

         <p className={styles['completion-rate']}>
            Task Completion Rate:&nbsp; 
            <span>{
               taskList && 
                  taskList.length > 0 
                     ?
                        completedTaskCount + '/' + taskList.length + 
                        ` (${Math.round(completedTaskCount / taskList.length * 100)}%)`
                     : 'N/A'
            }</span>
         </p>

         <h3>Upcoming Tasks</h3>
         <TaskList projectId={project._id} initialPageSize={5}
            selectColumns={['title', 'description', 'status', 'priority', 'sprint']}
            filterByStatus={['Open', 'In Progress']}
         />
      </article>
   );
};