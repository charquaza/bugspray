'use client'

import { useState } from 'react';
import { useUserData } from '@/app/_hooks/hooks';
import ProjectCreateForm from '@/app/_components/ProjectCreateForm';
import ProjectList from '@/app/_components/ProjectList';

export default function ProjectsPage() {
   const user = useUserData();
   const [ updateProjectList, setUpdateProjectList ] = useState(false);

   return (
      <main>
         <h1>Projects</h1>

         {(user && user.privilege === 'admin') &&
            <ProjectCreateForm setUpdateProjectList={setUpdateProjectList} />
         }

         <ProjectList 
            updateProjectList={updateProjectList} 
            setUpdateProjectList={setUpdateProjectList} 
         />
      </main>
   );
};