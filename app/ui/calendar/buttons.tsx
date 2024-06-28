import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
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

export function AddEventButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex items-center">

      {/* add */}
      <button
        onClick={onClick}
        className="flex h-12 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span className="hidden md:block md:mr-2 font-bold">Add</span>{' '}
        <PlusIcon className="h-5 md:ml-4" />
      </button>
    </div>
  );
}

export function QuickPlanButton({ onClick }: { onClick: () => void }) {
  const handleQuickPlanClick = () => {
    const promptText = 'Please enter your estimated duration (in hours):';
    const estimatedDuration = window.prompt(promptText, '2'); // Default to 2 hours

    if (estimatedDuration !== null) {
      onClick(); // Invoke the onClick handler passed from CalendarPage component
    }
  };

  return (
    <button
      onClick={handleQuickPlanClick}
      className="flex h-12 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
    >
      <span className="hidden md:block md:mr-2 font-bold">QuickPlan</span>{' '}
      <ChatBubbleBottomCenterTextIcon className="h-5 md:ml-4" />
    </button>
  );
}