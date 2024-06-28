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
  Meeting
} from './definitions';
import { formatCurrency } from './utils';
import exp from 'constants';
import { fetchContent } from './actions';
import { format } from 'date-fns';

export async function fetchMeetings(){
  noStore();
  try {
    // query 
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await sql<Meeting>`
      SELECT
        user_id,
        meeting_id,
        title,
        date,
        status
      FROM meetings
      ORDER BY date DESC;`
      
      return data.rows;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch meetings.');
  } 
}


export async function fetchCardData() {
  noStore();
  try {
    const totalTodoListsPromise = sql`SELECT COUNT(*) AS count FROM todos`;
    const scheduledMeetingsPromise = sql`SELECT COUNT(*) AS count FROM meetings WHERE status = 'scheduled'`;
    const summariedMeetingsPromise = sql`SELECT COUNT(*) AS count FROM meetings WHERE status = 'summary'`;
    const totalMeetingsPromise = sql`SELECT COUNT(*) AS count FROM meetings`;

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

export async function fetchFilteredMeetings(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try{
      const data = await sql<Meeting>`
        SELECT
          user_id,
          meeting_id,
          date,
          title,
          status
        FROM meetings
        WHERE
          title LIKE ${`%${query}%`} OR
          status LIKE ${`%${query}%`}
        ORDER BY date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset};`;

        const summaries = await Promise.all(
          data.rows.map(async (row: any) => {
            try {
              const summary_data = await fetchContent(row.meeting_id, 'summaries')
              if (summary_data.content && summary_data.content.length > 0) {
                if (summary_data.content.length > 40) {
                  row.meeting_summary_content = summary_data.content.substring(0, 40) + '...';
                } else{
                  row.meeting_summary_content = summary_data.content;
                }
              } else{
                  row.meeting_summary_content = 'No summary content.';
              }
            }
            catch (error) {
                row.meeting_summary_content = 'No summary content.';
            }
          return row;
        }))
        return data.rows;

      } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch meetings.');
      }

  }

  export async function fetchMeetingsPages(query: string) {
    try {
      const countResult = await sql`
        SELECT COUNT(*) AS count
        FROM meetings
        WHERE
          title LIKE ${`%${query}%`} OR
          status LIKE ${`%${query}%`} OR
          meeting_content LIKE ${`%${query}%`} OR
          meeting_summary LIKE ${`%${query}%`};
      `;
      const totalPages = Math.ceil(Number(countResult.rows[0].count) / ITEMS_PER_PAGE);
      return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of meetings.');
  }
}

export async function fetchMeetingById(meeting_id: string) {
  try {
    const data = await sql<Meeting>`
      SELECT
        user_id,
        meeting_id,
        title,
        date,
        status,
        meeting_content,
        meeting_summary
      FROM meetings
      WHERE meeting_id = ${meeting_id};`;

    return data.rows[0];

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch meeting.');
  }
}

export async function getUser(email: string) {
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