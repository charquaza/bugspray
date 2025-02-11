'use client'

import { useUserData } from '@/app/_hooks/hooks';
import ProjectCreateForm from '@/app/_components/ProjectCreateForm';
import ProjectList from '@/app/_components/ProjectList';

export default function ProjectsPage() {
   const user = useUserData();

   return (
      <main>
         <h1>Projects</h1>

         {(user && user.privilege === 'admin') &&
            <ProjectCreateForm />
         }

         <ProjectList />
      </main>
   );
};