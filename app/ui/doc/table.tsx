import Image from 'next/image';
import { UpdateDoc, DeleteDoc } from '@/app/ui/doc/buttons';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredDocuments } from '@/app/lib/data';
import { format } from 'date-fns';
import { Documents } from '@/app/lib/definitions';
import { auth } from '@/auth';


export default async function DocsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const session = await auth();
  if(!session){
    return;
  }
  const user_id = session.user.id;
  const documents = await fetchFilteredDocuments(query, currentPage, user_id);
  console.log('documents:', documents);
  if(documents === null){
      return;
  }
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {documents?.map((document:Documents) => (
              <div
                key={document.document_id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    {document.document_content}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Title
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Summary
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {documents?.map((document:Documents) => (
                <tr
                  key={document.document_id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {document.title}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {document.document_summary_content}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateDoc id={document.document_id} />
                      <DeleteDoc id={document.document_id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
