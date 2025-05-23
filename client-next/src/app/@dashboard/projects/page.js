'use client'

import { useState } from 'react';
import ProjectCreateForm from '@/app/_components/ProjectCreateForm';
import ProjectList from '@/app/_components/ProjectList';

export default function ProjectsPage() {
   const [ updateProjectList, setUpdateProjectList ] = useState(false);

   return (
      <main>
         <h1>Projects</h1>

         <ProjectCreateForm setUpdateProjectList={setUpdateProjectList} />

         <ProjectList 
            updateProjectList={updateProjectList} 
            setUpdateProjectList={setUpdateProjectList} 
         />
      </main>
   );
};