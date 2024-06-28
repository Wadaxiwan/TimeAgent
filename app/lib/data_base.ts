import { sql } from '@vercel/postgres';
const ITEMS_PER_PAGE = 10;

export class DataFetcher<T> {
    tableName: string;
    primaryKey: string;
  
    constructor(tableName: string, primaryKey: string) {
      this.tableName = tableName;
      this.primaryKey = primaryKey;
    }

    async fetchById(id: string, user_id: string): Promise<T | null> {
      try {
        const data = null;
        if(this.tableName === 'meetings') {
            const data = await sql`
            SELECT *
            FROM meetings
            WHERE meeting_id = ${id} AND
            user_id = ${user_id}
            ;`;
            return data.rows[0];
        } else if(this.tableName === 'documents') {
            const data = await sql`
            SELECT *
            FROM documents
            WHERE document_id = ${id} AND
            user_id = ${user_id}
            ;`;
            return data.rows[0];
        }
      } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch data from ${this.tableName}.`);
      }
    }

    async fetchFiltered(query: string, currentPage: number, itemsPerPage: number, user_id:string): Promise<T[]> {
      const offset = (currentPage - 1) * itemsPerPage;
  
      try {
        const data = null;
        if(this.tableName === 'meetings') {
            const data = await sql<T>`
            SELECT *
            FROM meetings
            WHERE
              user_id = ${user_id} AND (title LIKE ${`%${query}%`} OR status LIKE ${`%${query}%`})
            ORDER BY date DESC
            LIMIT ${itemsPerPage}
            OFFSET ${offset};`;
            return data.rows;
        } else if(this.tableName === 'documents') {
            const data = await sql<T>`
            SELECT *
            FROM documents
            WHERE
              user_id = ${user_id} AND (title LIKE ${`%${query}%`})
            LIMIT ${itemsPerPage}
            OFFSET ${offset};`;
            return data.rows;
        }
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch filtered data from ${this.tableName}.`);
      }
    }
  
    async fetchTotalPages(query: string, itemsPerPage: number, user_id:string): Promise<number> {
      try {
        const countResult = null;
        if(this.tableName === 'meetings') {
            const countResult = await sql<T>`
            SELECT COUNT(*)
            FROM meetings
            WHERE
              user_id = ${user_id} AND
              (title LIKE ${`%${query}%`} OR
              status LIKE ${`%${query}%`});`;
        } else if(this.tableName === 'documents') {
            const countResult = await sql<T>`
            SELECT COUNT(*)
            FROM documents
            WHERE
              user_id = ${user_id} AND
              title LIKE ${`%${query}%`}
            `
        }
        if(countResult === null){
            return 1;
        }
        const totalPages = Math.ceil(Number(countResult.rows[0].count) / itemsPerPage);
        return totalPages;
      } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch total pages from ${this.tableName}.`);
      }
    }
  
    async fetchAll(user_id:string): Promise<T[]> {
      try {
        const data = null;
        if(this.tableName === 'meetings') {
            const data = await sql<T>`
            SELECT *
            FROM meetings
            WHERE user_id = ${user_id}
            ORDER BY date DESC;`;
            return data.rows;
        } else if(this.tableName === 'documents') {
            const data = await sql<T>`
            SELECT *
            FROM documents
            WHERE user_id = ${user_id}
            ORDER BY date DESC;`;
            return data.rows;
        }
        return data.rows;
      } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch all data from ${this.tableName}.`);
      }
    }
  }
  