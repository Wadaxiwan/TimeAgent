'use client';
import { updateMeeting, generateSummary, fetchContent } from '@/app/lib/actions';
import { User, Meeting } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CalendarIcon,
  UserCircleIcon,
  ArchiveBoxArrowDownIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs/promises';


export default function EditMeetingForm({
  meeting,
  users,
}: {
  meeting: Meeting;
  users: User[];
}) {
  const updateMeetingWithId = updateMeeting.bind(null, meeting.meeting_id);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const formattedDate = format(new Date(meeting.date), 'yyyy-MM-dd HH:mm:ss');
  const [isGenerating, setIsGenerating] = useState(false);

  console.log('meeting:', meeting);
  // judge the path is exist or notuseEffect(() => {
    useEffect(() => {
      async function loadContent() {
          try {
            const data = await fetchContent(meeting.meeting_id, 'contents');
            if (data.content) {
              setContent(data.content);
            }
          } catch (error) {
            console.error('Failed to fetch content:', error);
          }
        }
  
      async function loadSummary() {
        try {
            const data = await fetchContent(meeting.meeting_id, 'summaries');
            if (data.content) {
              setSummary(data.content);
            }
          } catch (error) {
            console.error('Failed to fetch summary:', error);
          } 
        }
  
      loadContent();
      loadSummary();
    }, [meeting.meeting_content, meeting.meeting_id, meeting.meeting_summary]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await generateSummary(content, meeting.meeting_id);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form action={updateMeetingWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* User Selection */}
        <div className="mb-4">
          <label htmlFor="user" className="mb-2 block text-sm font-medium">
            Choose user
          </label>
          <div className="relative">
            <select
              id="user"
              name="userId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={meeting.user_id}
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Meeting Title */}
        <div className="mb-4">
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Meeting Title
          </label>
          <div className="relative">
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={meeting.title}
              placeholder="Enter meeting title"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <ArchiveBoxArrowDownIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Meeting Content */}
        <div className="mb-4">
          <label htmlFor="content" className="mb-2 block text-sm font-medium">
            Meeting Content
          </label>
          <div className="relative">
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter meeting content"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              rows={4}
            ></textarea>
          </div>
        </div>

        {/* Generate Summary Button */}
        <div className="mb-4">
          <Button type="button" onClick={handleGenerateSummary} disabled={isGenerating}>
            {isGenerating ? 'Generating Summary...' : 'Generate Summary'}
          </Button>
        </div>

        {/* Meeting Summary */}
        <div className="mb-4">
          <label htmlFor="summary" className="mb-2 block text-sm font-medium">
            Meeting Summary
          </label>
          <div className="relative">
            <textarea
              id="summary"
              name="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Meeting summary will be generated here"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              rows={4}
            ></textarea>
          </div>
        </div>

        {/* Meeting Date */}
        <div className="mb-4">
          <label htmlFor="date" className="mb-2 block text-sm font-medium">
            Meeting Date
          </label>
          <div className="relative">
            <input
              id="date"
              name="date"
              type="datetime-local"
              defaultValue={formattedDate}
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Meeting Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the meeting status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="scheduled"
                  name="status"
                  type="radio"
                  value="scheduled"
                  defaultChecked={meeting.status === 'scheduled'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="scheduled"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Scheduled <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="completed"
                  name="status"
                  type="radio"
                  value="completed"
                  defaultChecked={meeting.status === 'completed'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="completed"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Completed <CheckIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="summary-status"
                  name="status"
                  type="radio"
                  value="summary"
                  defaultChecked={meeting.status === 'summary'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="summary-status"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Summary <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/meeting"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isGenerating}>Edit Meeting</Button>
      </div>
    </form>
  );
}
