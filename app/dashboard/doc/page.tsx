import Pagination from '@/app/ui/doc/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/doc/table';
import { CreateDoc } from '@/app/ui/doc/buttons';
import { lusitana } from '@/app/ui/fonts';
// import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
// import { fetchInvoicesPages } from '@/app/lib/data'; 
import { Metadata } from 'next';
import { fetchDocumentsPages, fetchMeetingsPages } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Document Management',
};

export default async function Page(
  {
    searchParams,
  }: {
    searchParams?: {
      query?: string;
      page?: string;
    };
  }
) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchDocumentsPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Documents</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search doc ..." />
        <CreateDoc />
      </div>
       <Suspense key={query + currentPage} >
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}