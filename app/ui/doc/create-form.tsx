'use client';
// import { TODO } from '@/app/lib/definitions';
import Link from 'next/link';
import { CheckIcon, ClockIcon, CalendarIcon, UserCircleIcon, InboxIcon, PaperAirplaneIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createDoc ,generateContent} from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useState } from 'react';


export default function Form() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createDoc, initialState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const handleGenerateText = async () => {
    setIsGenerating(true);
    try {

      const response = await generateContent(description);
      // const response = await generateContent("this is a test");
      setContent(response.summary);
      // setContent("this is a test");
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">

        {/* document title */}
        <div className="mb-4">
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            document title
          </label>
          <div className="relative">
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter document title"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="title-error"
            />
          <InboxIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="title-error" aria-live="polite" aria-atomic="true">
          {state.errors?.title &&
            state.errors.title.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
        </div>

        {/* Description input */}
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description
          </label>
          <div className="relative">
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="description-error"
            />
            <InboxIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {/* <div id="description-error" aria-live="polite" aria-atomic="true">
            {state.errors?.description &&
              state.errors.description.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div> */}
        </div>

        {/* Generate Text Button */}
        <div className="mb-4">
          <Button type="button" onClick={handleGenerateText} disabled={isGenerating}>
            {isGenerating ? 'Generating Text...' : 'Generate Text'}
          </Button>
        </div>



        {/* document content */}
        <div className="mb-4">
          <label htmlFor="summary" className="mb-2 block text-sm font-medium">
            Document Summary
          </label>
          <div className="relative">
            <textarea
              id="summary"
              name="summary"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document summary will be generated here"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              rows={10}
            ></textarea>
          </div>
        </div> 
        {/* <div className="mb-4">
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            document content
          </label>
          <div className="relative">
          <textarea
            id="title"
            name="title"
            placeholder="Enter document content"
            rows={10}  
            className="peer block w-full rounded-md border border-gray-200 p-4 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="title-error"
          ></textarea>
          </div>
          <div id="title-error" aria-live="polite" aria-atomic="true">
          {state.errors?.title &&
            state.errors.title.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div> */}
        {/* </div> */}

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/doc"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create document</Button>
      </div>
    </form>
  );
}
