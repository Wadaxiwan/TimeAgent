import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { lusitana } from '@/app/ui/fonts';
import { Meeting } from '@/app/lib/definitions';
import { format } from 'date-fns';
import {fetchMeetings} from '@/app/lib/data';

const statusColorMap: { [key: string]: string } = {
  scheduled: 'bg-blue-500',
  completed: 'bg-green-500',
  summary: 'bg-yellow-500',
};

const statusTextMap: { [key: string]: string } = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  summary: 'Summarize',
};

export default async function Meetings() {
  const meetings = await fetchMeetings();
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Meetings
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {meetings.slice(0, 5).map((meeting, i) => (
            <div
              key={meeting.id}
              className={clsx(
                'flex flex-row items-center justify-between py-4',
                {
                  'border-t': i !== 0,
                },
              )}
            >
              <div className="flex flex-col">
                <p className="truncate text-sm font-semibold md:text-base">
                  {meeting.title}
                </p>
              </div>
              <div className="flex flex-row items-center space-x-4">
                <div className="flex items-center">
                  <span
                    className={clsx(
                      'inline-block w-2.5 h-2.5 rounded-full',
                      statusColorMap[meeting.status],
                      'mr-2'
                    )}
                  ></span>
                  <p className="ml-2 text-sm text-gray-500">{statusTextMap[meeting.status]}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(meeting.date), 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
