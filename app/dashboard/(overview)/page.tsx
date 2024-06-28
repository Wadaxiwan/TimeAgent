import { Card } from '@/app/ui/dashboard/cards';
import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import Todos from '@/app/ui/dashboard/latest-todos';
import Meetings from '../../ui/dashboard/latest-meetings';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData} from '@/app/lib/data';
import { Component, Suspense } from 'react';
import { CardSkeleton, MeetingsSkeleton } from '@/app/ui/skeletons';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import PasteArea from '@/app/ui/dashboard/paste_area';
import Plan from '@/app/ui/dashboard/plan';
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();
  if(!session){
      return;
  }
  const user_id = session.user.id;
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Hey there! Welcome to Time Agent.
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CardWrapper />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<MeetingsSkeleton />}>
          <Meetings/>
          <Todos/>
        </Suspense>
      </div>
      <h2 className={`${lusitana.className} mt-6  mb-4 text-xl md:text-2xl`}>
          Paste Your Content
      </h2>
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4">
        <PasteArea user_id={user_id}/>
      </div>
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4">
        <Plan />
      </div>
    </main>
  );
}
