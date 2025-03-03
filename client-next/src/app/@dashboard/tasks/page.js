'use client'

import { useState } from 'react';
import { useUserData } from '@/app/_hooks/hooks';
import TaskCreateForm from '@/app/_components/TaskCreateForm';
import TaskList from '@/app/_components/TaskList';

export default function TasksPage() {
   const user = useUserData();
   const [ updateTaskList, setUpdateTaskList ] = useState(false);

   return (
      <main>
         <h1>Tasks</h1>
         
         {(user && user.privilege === 'admin') &&
            <TaskCreateForm setUpdateTaskList={setUpdateTaskList} />
         }
         <TaskList 
            updateTaskList={updateTaskList} 
            setUpdateTaskList={setUpdateTaskList}
         />
      </main>
   );
};