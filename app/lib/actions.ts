'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { Meeting, Meeting_Todo } from './definitions';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
const { exec } = require('child_process');
import { Todo } from './definitions';

export type State = {
  errors?: {
    userId?: string[];
    title?: string[];
    date?: string[];
  };
  message?: string | null;
};


const FormSchema = z.object({
  userId: z.string({
    message: 'User ID is required.',
  }), 
  title: z.string({
    message: 'Title is required.',
  }),
  meetingContent: z.string().optional().nullable(),
  meetingSummary: z.string().optional().nullable(),
  status: z.enum(['scheduled', 'completed', 'summary']),
  date: z.string({
    message: 'Date is required.',
  }),
});

const CreateMeeting = FormSchema.omit({ id: true });

export async function createMeeting(prevState: State, formData: FormData) {

  const validatedFields = CreateMeeting.safeParse({
    userId: formData.get('userId'),
    title: formData.get('title'),
    meetingContent: formData.get('meetingContent') || '',
    meetingSummary: formData.get('meetingSummary') || '',
    status: formData.get('status'),
    date: formData.get('date'),
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Meeting.',
    };
  }

  const meeting_id = uuidv4(); // 生成唯一的会议 ID

  const { userId, title, meetingContent, meetingSummary, status, date } = validatedFields.data;

  try {
    const data = await sql<Meeting>`
      INSERT INTO meetings (meeting_id, user_id, title, status, date)
      VALUES (${meeting_id}, ${userId}, ${title}, ${status}, ${date})
      RETURNING *
    `;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create meeting.');
  }

  revalidatePath('/dashboard/meeting');
  redirect('/dashboard/meeting');
}


const UpdateMeeting = FormSchema.omit({ id: true, date: true });

export async function updateMeeting(id: string, formData: FormData) {
  const { userId, title, meetingContent, meetingSummary, status } = UpdateMeeting.parse({
    userId: formData.get('userId'),
    title: formData.get('title'),
    meetingContent: formData.get('content') || '',
    meetingSummary: formData.get('summary') || '',
    status: formData.get('status'),
  });

  console.log('Updating meeting:', { id, userId, title, status, meetingContent, meetingSummary });

  const contentDir = path.join(process.cwd(), 'public', 'contents');
  const contentPath = path.join(contentDir, `${id}_content.txt`);
  const summaryDir = path.join(process.cwd(), 'public', 'summaries');
  const summaryPath = path.join(summaryDir, `${id}_summary.txt`);

  try {
    await fs.mkdir(contentDir, { recursive: true });
    await fs.writeFile(contentPath, meetingContent, 'utf8');

    await fs.mkdir(summaryDir, { recursive: true });
    await fs.writeFile(summaryPath, meetingSummary, 'utf8');

    sql`
    UPDATE meetings
    SET 
      user_id = ${userId}, 
      title = ${title}, 
      status = ${status}
    WHERE 
      meeting_id = ${id}
    RETURNING *
    `;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update meeting.');
  }

  revalidatePath('/dashboard/meeting');
  redirect('/dashboard/meeting');
}

export async function deleteMeeting(id: string) {
  try {

    const result = await sql`
      DELETE FROM meetings
      WHERE meeting_id = ${id}
    `;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete meeting.');
  }
  
  revalidatePath('/dashboard/meeting');
}


export async function generateSummary(content: string, meeting_id: string) {
  const contentDir = path.join(process.cwd(), 'public', 'contents');
  const contentPath = path.join(contentDir, `${meeting_id}_content.txt`);

  await fs.mkdir(contentDir, { recursive: true });
  await fs.writeFile(contentPath, content, 'utf8');

  const summaryDir = path.join(process.cwd(), 'public', 'summaries');
  await fs.mkdir(summaryDir, { recursive: true });
  
  const summaryPath = path.join(summaryDir, `${meeting_id}_summary.txt`);

  return new Promise((resolve, reject) => {
    exec(`python module/meeting_summary.py --in_path ${contentPath} --out_path ${summaryPath}`, async (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(`exec error: ${error}`);
        return;
      }

      try {
        const summary = await fs.readFile(summaryPath, 'utf8');
        resolve({ summary });
      } catch (readError) {
        reject(`read error: ${readError}`);
      }
    });
  });

}


export async function fetchContent(meeting_id: string, type: string) {

  let filePath = '';
  if ('contents' === type ) {
    filePath = path.join(process.cwd(), 'public', type, `${meeting_id}_content.txt`);
  } else if('summaries' === type) {
    filePath = path.join(process.cwd(), 'public', type, `${meeting_id}_summary.txt`);
  }

  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    return { content: fileData };
  } catch (error) {
    return { content: 'No summary content available.' };
  }
}

export async function fetchTodos(){
  try {
    const data = await sql<Todo>`
      SELECT
        todo_id,
        title,
        start_date,
        end_date,
        progress
      FROM todos
      ORDER BY start_date
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch todos.');
  }
}

export async function fetchMeetingsAsTodos(){
  try {
    const data = await sql<Meeting_Todo>`
      SELECT
        meeting_id,
        title,
        date,
        status
      FROM meetings
      `;      
      return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch meetings.');
  } 
}

export async function createOrUpdateTodo(todo: any) {
  try{
    if (todo.todo_id) {
      // 如果传入的 todo 包含 todo_id，则执行更新操作
      await sql`
        UPDATE todos
        SET title = ${todo.title}, start_date = ${todo.start_date}, end_date = ${todo.end_date}, progress = ${todo.progress}
        WHERE todo_id = ${todo.todo_id}
      `;
      const newTodo: Todo[] = [{
        todo_id: todo.todo_id,
        title: todo.title,
        start_date: todo.start_date,
        end_date: todo.end_date,
        progress: todo.progress ?? 0,
      }];
      return newTodo;
    } else {
      // 否则执行插入操作
      const todo_id = uuidv4();
      const user_id = '410544b2-4001-4271-9855-fec4b6a6442a';
      await sql`
        INSERT INTO todos (todo_id, user_id, title, start_date, end_date, progress)
        VALUES (${todo_id}, ${user_id}, ${todo.title}, ${todo.start_date}, ${todo.end_date}, ${todo.progress ?? 0})
      `;
      const newTodo: Todo[] = [{
        todo_id: todo_id,
        title: todo.title,
        start_date: todo.start_date,
        end_date: todo.end_date,
        progress: todo.progress ?? 0,
      }];
      return newTodo;
    }
  }
  catch (error) {
    console.error('Database Error:', error);
    throw ('createOrUpdateTodo:' + error);
  }
}

export async function deleteTodo(todo_id: any) {
  sql`
    DELETE FROM todos
    WHERE todo_id = ${todo_id}
  `;
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}