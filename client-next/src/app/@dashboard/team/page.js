'use client'

import { useState } from 'react';
import { useUserData } from '@/app/_hooks/hooks';
import MemberCreateForm from '@/app/_components/MemberCreateForm';
import MemberList from '@/app/_components/MemberList';

export default function TeamPage() {
   const user = useUserData();
   const [ updateMemberList, setUpdateMemberList ] = useState(false);
   
   return (
      <main>
         <h1>Team</h1>

         {(user && user.privilege === 'admin') &&
            <MemberCreateForm setUpdateMemberList={setUpdateMemberList} />
         }

         <MemberList 
            updateMemberList={updateMemberList} 
            setUpdateMemberList={setUpdateMemberList} 
         />
      </main>
   );
};