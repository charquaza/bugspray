'use client'

import { useState } from 'react';
import TaskCreateForm from '@/app/_components/TaskCreateForm';
import TaskList from '@/app/_components/TaskList';

export default function TasksPage() {
   const [ updateTaskList, setUpdateTaskList ] = useState(false);

   return (
      <main>
         <h1>Tasks</h1>
         
         <TaskCreateForm setUpdateTaskList={setUpdateTaskList} />

         <TaskList 
            updateTaskList={updateTaskList} 
            setUpdateTaskList={setUpdateTaskList}
         />
      </main>
   );
};