const { db } = require('@vercel/postgres');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');


const {
  meetings,
  users,
} = require('../app/lib/placeholder-data.js');

async function seedUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;
    console.log(`Created "users" table`);

    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING;
          `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedMeetings(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS meetings (
      meeting_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      title VARCHAR(255) NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      meeting_content VARCHAR(255),
      meeting_summary VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`;
    console.log(`Created "meetings" table`);

    const insertedMeetings = await Promise.all(
      meetings.map((meeting) => {
        meeting.meeting_id = uuidv4();
        return client.sql`
          INSERT INTO meetings (meeting_id, user_id, title, status, date, meeting_content, meeting_summary)
          VALUES (${meeting.meeting_id}, ${meeting.user_id}, ${meeting.title}, ${meeting.status}, ${meeting.date}, ${meeting.meeting_content}, ${meeting.meeting_summary})
          ON CONFLICT (meeting_id) DO NOTHING;
          `;         
      }),
    );

    console.log(`Seeded ${insertedMeetings.length} meetings`);

    return {
      createTable,
      meetings: insertedMeetings,
    };
  } catch (error) {
    console.error('Error seeding meetings:', error);
    throw error;
  }
}

async function seedDocuments(client) {

  // 删除 Document
  try {
    await client.sql`DROP TABLE IF EXISTS documents`;
    console.log(`Dropped "documents" table`);
  } catch (error) {
    console.error('Error dropping documents:', error);
    throw error;
  }
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS documents (
      document_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      title VARCHAR(255) NOT NULL,
      document_content VARCHAR(255),
      document_summary VARCHAR(255),
      document_correction VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`;
    console.log(`Created "documents" table`);
    return {
      createTable,
    };
  } catch (error) {
    console.error('Error seeding meetings:', error);
    throw error;
  }
}



async function main() {

  const client = await db.connect();
  
  await seedUsers(client);
  // await seedMeetings(client);
  // await seedDocuments(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
