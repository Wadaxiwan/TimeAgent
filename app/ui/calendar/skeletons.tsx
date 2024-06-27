import exp from "constants";

// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
      style={{ width: '60vw', margin: '0 auto' }} // Adjust width here
    >
      <div className="flex p-4">
        <div className="h-5 w-96 rounded-md bg-gray-200" style={{ width: '40vw'}}/>
        <div className="ml-2 h-48 w-96 rounded-md bg-gray-200 text-sm font-medium" style={{ width: '60vw'}}/>
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8" 
      style={{height: '200px', margin: '10px 10px' }}
      ></div>
    </div>
  );
}

export default function CalendarSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-12 w-96 overflow-hidden rounded-md bg-gray-100`}
        style={{ width: '60vw', margin: '30px auto 0px auto' }} // Adjust width here
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      style={{ width: '60vw', margin: '10px auto 20px auto' }}
      >
        <CardSkeleton />
      </div>
    </>
  );
}