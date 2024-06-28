import { Card } from '@/app/ui/dashboard/cards';
import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import Todos from '@/app/ui/dashboard/latest-todos';
import Meetings from '../../ui/dashboard/latest-meetings';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData} from '@/app/lib/data';
import { Suspense } from 'react';
import { CardSkeleton, MeetingsSkeleton } from '@/app/ui/skeletons';
 
export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Hey there! Welcome to Time Agent.
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CardWrapper />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* {<RevenueChart revenue={revenue}  />} */}
        {/* <Meetings meetings={meetings} /> */}
        <Suspense fallback={<MeetingsSkeleton />}>
          <Meetings/>
          <Todos/>
        </Suspense>
      </div>
    </main>
  );
}