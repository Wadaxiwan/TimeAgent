import { fetchFilteredUsers } from '@/app/lib/data';
import { MetaData } from '@lobehub/ui';
import { auth } from "@/auth"
import Calendar from '../../ui/calendar/component';
import React from 'react';

export const metadata: MetaData = {
  title: 'Create Meeting',
};


export default async function Page() {

  const users = await fetchFilteredUsers('');
  const session = await auth();

  if (!session.user) return null
   
  return (
    <main>
      <Calendar user_id={session.user.id}/>
    </main>
  );
}