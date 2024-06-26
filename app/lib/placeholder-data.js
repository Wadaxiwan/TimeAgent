// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data
const users = [
  {
    id: 'edfb5480-3aaf-4cb5-a6ac-ed31e43a3ba6',
    name: 'YundanChen',
    email: '2021113667@stu.hit.edu.cn',
    password: '123456',
  },
];

const meetings = [
  {
    meeting_id: '100544b2-4001-4271-9855-fec4b6a6442m',
    user_id: '410544b2-4001-4271-9855-fec4b6a6442a',
    title: 'Meeting with John Doe',
    status: 'completed',
    date: '2024-06-01 10:00:00',
    meeting_content: '',
    meeting_summary: '',
  },
  {
    meeting_id: '200544b2-4001-4271-9855-fec4b6a6442m',
    user_id: '410544b2-4001-4271-9855-fec4b6a6442a',
    title: 'Meeting with Moonshot',
    status: 'scheduled',
    date: '2024-06-09 10:00:00',
    meeting_content: '',
    meeting_summary: '',
  }
]

const todos = [
  {
    todo_id: '300544b2-4001-4271-9855-fec4b6a6442m',
    user_id: '410544b2-4001-4271-9855-fec4b6a6442a',
    title: 'Buy groceries',
    start_date: '2024-06-01 08:00:00',
    end_date: '2024-06-01 10:00:00',
    progress: 50,
  }
]

module.exports = {
  users,
  meetings,
  todos
};
