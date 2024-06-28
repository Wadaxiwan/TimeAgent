import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
const ITEMS_PER_PAGE = 10;


import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Meeting,
  Documents
} from './definitions';
import { formatCurrency } from './utils';
import exp from 'constants';
import { fetchContent } from './actions';
import { format } from 'date-fns';
import { DataFetcher } from './data_base';

export async function fetchCardData(user_id: string) {
  noStore();
  try {
    const totalTodoListsPromise = sql`SELECT COUNT(*) FROM todos WHERE user_id=${user_id}`;
    const scheduledMeetingsPromise = sql`SELECT COUNT(*) FROM meetings WHERE user_id=${user_id} AND status='scheduled'`;
    const summariedMeetingsPromise = sql`SELECT COUNT(*) FROM meetings WHERE user_id=${user_id} AND status='summary'`;
    const totalMeetingsPromise = sql`SELECT COUNT(*) FROM meetings WHERE user_id=${user_id}`;

    const data = await Promise.all([
      totalTodoListsPromise,
      scheduledMeetingsPromise,
      summariedMeetingsPromise,
      totalMeetingsPromise,
    ]);

    const totalTodoLists = Number(data[0].rows[0].count ?? '0');
    const scheduledMeetings = Number(data[1].rows[0].count ?? '0');
    const summariedMeetings = Number(data[2].rows[0].count ?? '0');
    const totalMeetings = Number(data[3].rows[0].count ?? '0');

    return {
      totalTodoLists,
      scheduledMeetings,
      summariedMeetings,
      totalMeetings,
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}


class MeetingFetcher extends DataFetcher<Meeting> {
  constructor() {
    super('meetings', 'meeting_id');
  }
}

class DocumentFetcher extends DataFetcher<Document> {
  constructor() {
    super('documents', 'document_id');
  }
}

const meetingFetcher = new MeetingFetcher();
const documentFetcher = new DocumentFetcher();

export async function fetchMeetingById(meeting_id: string, user_id: string) {
  return await meetingFetcher.fetchById(meeting_id, user_id);
}

export async function fetchDocumentById(document_id: string, user_id: string) {
  return await documentFetcher.fetchById(document_id, user_id);
}

export async function fetchFilteredMeetings(query: string, currentPage: number, user_id: string) {
  const data = await meetingFetcher.fetchFiltered(query, currentPage, ITEMS_PER_PAGE, user_id);

  const summaries = await Promise.all(
    data.map(async (row: any) => {
      try {
        const summary_data = await fetchContent(row.meeting_id, 'summary');
        if (summary_data.content && summary_data.content.length > 0) {
          if (summary_data.content.length > 40) {
            row.meeting_summary_content = summary_data.content.substring(0, 40) + '...';
          } else {
            row.meeting_summary_content = summary_data.content;
          }
        } else {
          row.meeting_summary_content = 'No summary content.';
        }
      } catch (error) {
        row.meeting_summary_content = 'No summary content.';
      }
      return row;
    })
  );
  return data;
}

export async function fetchMeetingsPages(query: string, user_id:string) {
  return await meetingFetcher.fetchTotalPages(query, ITEMS_PER_PAGE, user_id);
}


export async function fetchMeetings(user_id: string) {
  return await meetingFetcher.fetchAll(user_id);
}

export async function fetchFilteredDocuments(query: string, currentPage: number, user_id:string) {
  const data = await documentFetcher.fetchFiltered(query, currentPage, ITEMS_PER_PAGE, user_id);

  const enhancedData = await Promise.all(
    data.map(async (row: any) => {
      try {
        const correction_data = await fetchContent(row.document_id, 'doc_correction');
        if (correction_data.content && correction_data.content.length > 0) {
          if (correction_data.content.length > 60) {
            row.document_correction_content = correction_data.content.substring(0, 60) + '...';
          } else {
            row.document_correction_content = correction_data.content;
          }
        } else {
          row.document_correction_content = 'No correction content.';
        }
      } catch (error) {
        row.document_correction_content = 'No correction content.';
      }

      try {
        const summary_data = await fetchContent(row.document_id, 'doc_summary');
        if (summary_data.content && summary_data.content.length > 0) {
            if(summary_data.content.length > 60) {
              row.document_summary_content = summary_data.content.substring(0, 60) + '...';
            }else{
              row.document_summary_content = summary_data.content;
            }
        } else {
          row.document_summary_content = 'No summary content.';
        }
      } catch (error) {
        row.document_summary_content = 'No summary content.';
      }

      return row;
    })
  );
  return enhancedData;
}

export async function fetchDocumentsPages(query: string, user_id:string) {
  return await documentFetcher.fetchTotalPages(query, ITEMS_PER_PAGE, user_id);
}

export async function fetchDocuments(user_id: string) {
  return await documentFetcher.fetchAll(user_id);
}

export async function getAllUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchFilteredUsers(query: string) {
  try {
    const data = await sql<User>`
      SELECT
        id,
        email,
        name
      FROM users
      WHERE
        email LIKE ${`%${query}%`} OR
        name LIKE ${`%${query}%`}
      ORDER BY email ASC;`;

    return data.rows;
    
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch user table.');
  }
}