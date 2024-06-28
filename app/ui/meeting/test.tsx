'use client';
import { User } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createMeeting } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useState } from 'react';

export default function Form({ users }: { users: User[] }) {
    const initialState = { message: null, errors: {} };
    const [state, dispatch] = useFormState(createMeeting, initialState);
  
    return (
      <form action={dispatch}>
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/meeting"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={!isEmpty(state.errors) || state.message === 'Creating meeting'}>
            {state.message || 'Create Meeting'}
          </Button>
        </div>
      </form>
    );
  }
  
  function isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }
  