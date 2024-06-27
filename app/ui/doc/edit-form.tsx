'use client';
import { updateMeeting, generateSummary, fetchContent ,getCorrectionAdvice} from '@/app/lib/actions';
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
import DisplayJson from './displayJSON';


export default function EditDocForm({
  meeting,
  users,
}: {
  meeting: Meeting;
  users: User[];
}) {
  const updateMeetingWithId = updateMeeting.bind(null, meeting.meeting_id);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [correction, setCorrection] = useState('');
  const formattedDate = format(new Date(meeting.date), 'yyyy-MM-dd HH:mm:ss');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);

  const [triggerReload, setTriggerReload] = useState(0); // 用于触发重新加载

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

        async function loadCorrection() {
          try {
              const data = await fetchContent(meeting.meeting_id, 'correction');
              if (data.content) {
                setCorrection(data.content);
              }
            } catch (error) {
              console.error('Failed to fetch correction advice:', error);
            } 
          }
  
      loadContent();
      loadSummary();
      loadCorrection();
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

  const handleGenerateCorrection = async () => {
    setIsCorrecting(true);
    try {
      const response = await getCorrectionAdvice(content, meeting.meeting_id);
      setCorrection(response.summary);
    } catch (error) {
      console.error('Failed to generate correction advices:', error);
    } finally {
      setIsCorrecting(false);
    }
    // 触发重新加载
    setTriggerReload(prev => prev + 1);
  };

  // const handleGenerateCorrection = async () => {
  //   setIsCorrecting(true);
  //   try {
  //     const response = await getCorrectionAdvice(content, meeting.meeting_id);
  //     setCorrection(response.summary);
  //   } catch (error) {
  //     console.error('Failed to generate correction advices:', error);
  //   } finally {
  //     setIsCorrecting(false);
  //   }
  // };

  return (
    <form action={updateMeetingWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Document Title */}
        <div className="mb-4">
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Document title
          </label>
          <div className="relative">
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={meeting.title}
              placeholder="Enter document title"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <ArchiveBoxArrowDownIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* /* Meeting Content */}
        <div className="mb-4">
          <label htmlFor="content" className="mb-2 block text-sm font-medium">
            Document Content
          </label>
          <div className="relative">
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter meeting content"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              rows={20}
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
            Document Summary
          </label>
          <div className="relative">
            <textarea
              id="summary"
              name="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Document summary will be generated here"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
              rows={10}
            ></textarea>
          </div>
        </div> 

        {/* Document Correction Button */}
        <div className="mb-4">
          <Button type="button" onClick={handleGenerateCorrection} disabled={isCorrecting}>
            {isCorrecting ? 'Giving correction advice...' : 'Start Correction'}
          </Button>
        </div>
        <DisplayJson docID={meeting.meeting_id} triggerReload={triggerReload} />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/doc"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isGenerating}>Edit Document</Button>
      </div>
    </form>
  );
}
