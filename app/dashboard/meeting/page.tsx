import Pagination from '@/app/ui/meeting/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/meeting/table';
import { CreateMeeting } from '@/app/ui/meeting/buttons';
import { lusitana } from '@/app/ui/fonts';
import { MeetingsTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchMeetingsPages } from '@/app/lib/data';
import { MetaData } from '@lobehub/ui';
import { auth } from '@/auth';


export const metadata: MetaData = {
  title: 'Meetings',
};

export default async function Page({
    searchParams,
  }: {
    searchParams?: {
      query?: string;
      page?: string;
    };
  })  {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();
    if(!session){
      return;
    }
    const user_id = session.user.id;
    const totalPages = await fetchMeetingsPages(query, user_id);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Meetings</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search meetings..." />
        <CreateMeeting />
      </div>
      <Suspense key={query + currentPage} fallback={<MeetingsTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}