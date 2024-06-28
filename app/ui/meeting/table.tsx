import Image from 'next/image';
import { UpdateMeeting, DeleteMeeting } from '@/app/ui/meeting/buttons';
import MeetingStatus from '@/app/ui/meeting/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredMeetings } from '@/app/lib/data';
import { format } from 'date-fns';
import { auth } from '@/auth';


export default async function MeetingsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const session = await auth();
  const meetings = await fetchFilteredMeetings(query, currentPage, session?.user?.id);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {meetings?.map((meeting) => (
              <div
                key={meeting.meeting_id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="mb-2 text-xl font-medium">
                      {meeting.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(meeting.date), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                  <MeetingStatus status={meeting.status} />
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    {meeting.meeting_summary_content}
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
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
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
              {meetings?.map((meeting) => (
                <tr
                  key={meeting.meeting_id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {meeting.title}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {format(new Date(meeting.date), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <MeetingStatus status={meeting.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {meeting.meeting_summary_content}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateMeeting id={meeting.meeting_id} />
                      <DeleteMeeting id={meeting.meeting_id} />
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
