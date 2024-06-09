import { StarIcon } from '@heroicons/react/20/solid';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function MeetingStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': status === 'scheduled',
          'bg-green-100 text-green-800': status === 'completed',
          'bg-yellow-100 text-yellow-800': status === 'summary',
        },
      )}
    >
      {status === 'scheduled' && (
        <>
          Scheduled
          <ClockIcon className="ml-1 w-4 text-blue-800" />
        </>
      )}
      {status === 'completed' && (
        <>
          Completed
          <CheckIcon className="ml-1 w-4 text-green-800" />
        </>
      )}
      {status === 'summary' && (
        <>
          Summary
          <StarIcon className="ml-1 w-4 text-yellow-800" />
        </>
      )}
    </span>
  );
}
