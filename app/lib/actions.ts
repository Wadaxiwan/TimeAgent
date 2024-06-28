'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { Documents, Meeting } from './definitions';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
const { exec } = require('child_process');

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

const DocFormSchema = z.object({
  userId: z.string({
    message: 'User ID is required.',
  }), 
  title: z.string({
    message: 'Title is required.',
  }),
  content: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
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

const CreateDocument = DocFormSchema.omit({ id: true });

export async function createDoc(prevState: State, formData: FormData) {

  const validatedFields = CreateDocument.safeParse({
    title: formData.get('title'),
    userId: formData.get('userId'),
    content: formData.get('content') || '',
    summary: formData.get('summary') || '',
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Doc.',
    };
  }

  const document_id = uuidv4(); // 生成唯一的会议 ID
  const { title, userId, content, summary } = validatedFields.data;

  console.log('Creating document:', { document_id, userId, title, content, summary });

  try {
    const data = await sql<Documents>`
      INSERT INTO documents (document_id, user_id, title, document_content, document_summary)
      VALUES (${document_id}, ${userId}, ${title}, ${content}, ${summary})
      RETURNING *
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create document.');
  }

  revalidatePath('/dashboard/doc');
  redirect('/dashboard/doc');
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

  const contentDir = path.join(process.cwd(), 'public', 'content');
  const contentPath = path.join(contentDir, `${id}_content.txt`);
  const summaryDir = path.join(process.cwd(), 'public', 'summary');
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

export async function updateDocument(id: string, formData: FormData) {

  console.log('formData:', formData);

  const title = formData.get('title');
  const userId = formData.get('userId');
  const content = formData.get('content');
  const summary = formData.get('summary');

  console.log('Updating document:', { id, userId, title, content, summary });

  const contentDir = path.join(process.cwd(), 'public', 'doc_content');
  const contentPath = path.join(contentDir, `${id}_content.txt`);
  const summaryDir = path.join(process.cwd(), 'public', 'doc_summary');
  const summaryPath = path.join(summaryDir, `${id}_summary.txt`);


  try {
    await fs.mkdir(contentDir, { recursive: true });
    await fs.writeFile(contentPath, content, 'utf8');

    await fs.mkdir(summaryDir, { recursive: true });
    await fs.writeFile(summaryPath, summary, 'utf8');

    await sql`
    UPDATE documents
    SET 
      user_id = ${userId}, 
      title = ${title}
    WHERE 
      document_id = ${id}
    RETURNING *
    `;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update doc.');
  }

  revalidatePath('/dashboard/doc');
  redirect('/dashboard/doc');
}


export async function deleteTODO(id: string) {
  try {

    const result = await sql`
      DELETE FROM meetings
      WHERE meeting_id = ${id}
    `;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete todo.');
  }
  
  revalidatePath('/dashboard/todo');
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

export async function deleteDocument(id: string) {
  try {

    const result = await sql`
      DELETE FROM documents
      WHERE document_id = ${id}
    `;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete document.');
  }
  
  revalidatePath('/dashboard/doc');
}



export async function generateSummary(content: string, id: string) {
  const contentDir = path.join(process.cwd(), 'public', 'content');
  const contentPath = path.join(contentDir, `${id}_content.txt`);

  await fs.mkdir(contentDir, { recursive: true });
  await fs.writeFile(contentPath, content, 'utf8');

  const summaryDir = path.join(process.cwd(), 'public', 'summary');
  await fs.mkdir(summaryDir, { recursive: true });
  
  const summaryPath = path.join(summaryDir, `${id}_summary.txt`);

  return new Promise((resolve, reject) => {
    console.log('Generating summary...');
    exec(`python module/meeting_summary_gpt.py --in_path ${contentPath} --out_path ${summaryPath}`, async (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(`exec error: ${error}`);
        return;
      }
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      try {
        const summary = await fs.readFile(summaryPath, 'utf8');
        resolve({ summary });
      } catch (readError) {
        reject(`read error: ${readError}`);
      }
    });
  });
}

export async function getCorrectionAdvice(content: string, id: string) {
  const contentDir = path.join(process.cwd(), 'public', 'doc_content');
  const contentPath = path.join(contentDir, `${id}_content.txt`);

  await fs.mkdir(contentDir, { recursive: true });
  await fs.writeFile(contentPath, content, 'utf8');

  const correctionDir = path.join(process.cwd(), 'public', 'doc_correction');
  await fs.mkdir(correctionDir, { recursive: true });
  
  const correctionPath = path.join(correctionDir, `${id}_correction.json`);

  return new Promise((resolve, reject) => {
    exec(`python module/docCorrection/TextCorrection.py --in_path ${contentPath} --out_path ${correctionPath}`, async (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(`exec error: ${error}`);
        return;
      }

      try {
        const summary = await fs.readFile(correctionPath, 'utf8');
        resolve({ summary });
      } catch (readError) {
        reject(`read error: ${readError}`);
      }
    });
  });
}

export async function generateTmpContent(doccontent: string) {

  const id = uuidv4();

  const contentDir = path.join(process.cwd(), 'public', 'doc_content');
  const contentPath = path.join(contentDir, `${id}_content.txt`);

  await fs.mkdir(contentDir, { recursive: true });
  await fs.writeFile(contentPath, doccontent, 'utf8');

  const summaryDir = path.join(process.cwd(), 'public', 'doc_summary');
  await fs.mkdir(summaryDir, { recursive: true });
  
  const summaryPath = path.join(summaryDir, `${id}_summary.txt`);

  return new Promise((resolve, reject) => {
    exec(`python module/meeting_summary_gpt.py --in_path ${contentPath} --out_path ${summaryPath}`, async (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(`exec error: ${error}`);
        return;
      }

      try {
        const summary = fs.readFile(summaryPath, 'utf8');
        // del the contents and summary file
        await fs.rm(contentPath);
        await fs.rm(summaryPath);
        resolve({ summary });
      } catch (readError) {
        reject(`read error: ${readError}`);
      }
    });
  });

}


export async function fetchContent(id: string, type: string) {
  let filePath = '';
  if (type.includes('content')) {
    filePath = path.join(process.cwd(), 'public', type, `${id}_content.txt`);
  } else if(type.includes('summary')) {
    filePath = path.join(process.cwd(), 'public', type, `${id}_summary.txt`);
  }else if(type.includes('correction')) {
    filePath = path.join(process.cwd(), 'public', type, `${id}_correction.json`);
  }

  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    return { content: fileData };
  } catch (error) {
    return { content: 'No content available.' };
  }
}

export async function fetchTodos() {
  const rows = sql`SELECT * FROM todos ORDER BY date, priority`;
  return rows;
}

export async function createOrUpdateTodo(todo: any) {
  if (todo.id) {
    sql`
      UPDATE todos
      SET title = ${todo.title}, date = ${todo.date}, details = ${todo.details}, priority = ${todo.priority}
      WHERE id = ${todo.id}
    `;  
  } else {
    const id = uuidv4();
    sql`
      INSERT INTO todos (id, title, date, details, priority)
      VALUES (${id}, ${todo.title}, ${todo.date}, ${todo.details}, ${todo.priority})
    `;
  }
}

export async function deleteTodo(id: any) {
  sql`
    DELETE FROM todos
    WHERE id = ${id}
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