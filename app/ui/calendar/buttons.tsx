import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function PreviousMonthButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <ChevronLeftIcon className="w-5 h-5" />
      <span className="hidden md:block md:ml-2 font-bold">Previous</span>
    </button>
  );
}

export function NextMonthButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block md:mr-2 font-bold">Next</span>
      <ChevronRightIcon className="w-5 h-5" />
    </button>
  );
}

// export function AddEventButton({ onClick }: { onClick: () => void }) {
//   return (
//     <button
//       onClick={onClick}
//       className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
//     >
//       <span className="hidden md:block">Add Event</span>
//       <PlusIcon className="w-5 h-5" />
//     </button>
//   );
// }
export function AddEventButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-12 items-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      style={{ width: '25%' }}
    >
      <span className="hidden md:block md:mr-2 font-bold">Add Event</span>{' '}
      <PlusIcon className="h-5 w-5" />
    </button>
  );
}
