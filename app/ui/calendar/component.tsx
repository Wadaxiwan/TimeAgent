"use client";
import React, { useState, useEffect, Suspense } from 'react';
import '@/app/ui/calendar/calendar.css';
import { lusitana } from '@/app/ui/fonts';
import { PreviousMonthButton, NextMonthButton, AddEventButton, QuickPlanButton } from '@/app/ui/calendar/buttons';
import { Todo, Meeting_Todo } from '../../lib/definitions';
import { fetchTodos, fetchMeetingsAsTodos, createOrUpdateTodo, deleteTodo } from '@/app/lib/actions';
import CalendarSkeleton from '@/app/ui/calendar/skeletons';
import MeetingStatus from '@/app/ui/meeting/status';
import ReactDOM from 'react-dom';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export default function Calendar({
    user_id,
  }: {
    user_id: string
  }) {
    const [todos, setTodos] = useState<Todo[] | null>(null);
    const [meetings, setMeetings] = useState<Meeting_Todo[] | null>(null);
    const [newTodo, setNewTodo] = useState({ title: '', start_date: '', end_date: '' });
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [duration, setDuration] = useState(60);

    useEffect(() => {
        loadTodos();
    }, []);

    useEffect(() => {
        if (todos) {
            renderCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
        }
    }, [currentMonth, todos]);

    const handleAddTodo = async () => {
        if (newTodo.title && newTodo.start_date && newTodo.end_date) {
            // 检查结束日期不能早于开始日期
            if (new Date(newTodo.end_date) < new Date(newTodo.start_date)) {
                alert('End date cannot be earlier than start date.');
                return;
            }

            try {
                setLoading(true);
                const createdTodo = await createOrUpdateTodo(newTodo, user_id);
                setTodos([...todos, ...createdTodo]);
                setNewTodo({ title: '', start_date: '', end_date: ''});
            } catch (error) {
                console.error('Error adding todo:', error);
            } finally {
                setLoading(false);
            }
        } else {
            alert('Please enter both title and date.');
        }
    };

    const handleQuickPlan = async () => {
        try {
            // 获取从现在开始的三天内的todos
            const now = new Date();
            const threeDaysLater = new Date();
            threeDaysLater.setDate(now.getDate() + 3);

            const todosForThreeDays = todos?.filter(todo => {
                const todoDate = new Date(todo.start_date);
                return todoDate >= now && todoDate <= threeDaysLater;
            }) || [];

            const meetingsForThreeDays = meetings?.filter(meeting => {
                const meetingDate = new Date(meeting.date);
                return meetingDate >= now && meetingDate <= threeDaysLater;
            }) || [];
    
            // Prepare the message to display in alert
            let message = `I plan to work for ${duration} minutes, but I already have the following tasks scheduled:\n`;

            message += '\nFirstly, Todos for the next three days:\n';
            todosForThreeDays.forEach(todo => {
                message += `- ${todo.title} (${todo.start_date} to ${todo.end_date})\n`;
            });

            message += '\nSecondly,Meetings for the next three days:\n';
            meetingsForThreeDays.forEach(meeting => {
                message += `- ${meeting.title} (start ${meeting.date})\n`;
            });

            message += `Meetings typically last two hours.\n\nBased on this schedule, when would be the most suitable time for the ${duration} minutes of work? And the time must between 8:00 and 22:00. You must return the time in the format of "YYYY-MM-DD HH:MM" `;

            message += 'Please only return the start_time and end_time in JSON format:\n\n';
            message += '{\n';
            message += '    "start_time": "YYYY-MM-DD HH:MM",\n';
            message += '    "end_time": "YYYY-MM-DD HH:MM"\n';
            message += '}\n';
            message += 'Without any other content.\n';

            console.log('message:', message);

            const response = await fetch('http://localhost:3001/api/time', {
                method: 'POST',
                headers: {
                  'Content-Type': 'text/plain',
                },
                body: message,
              });
              
                const responseData = await response.json();
                console.log("responseData:", responseData);

                // Extract start_time and end_time
                const { start_time, end_time } = responseData;
                setNewTodo({
                    title: 'Something AI Todo',
                    start_date: start_time,
                    end_date: end_time
                });


        } catch (error) {
            console.error('Error handling quick plan:', error);
        }
    };    
    
      const fetchTodosForThreeDays = async (startDate: Date, endDate: Date) => {
        try {
          const fetchedTodos = await fetchTodos(user_id); // Assuming fetchTodos retrieves todos for the current user
          const todosForThreeDays = fetchedTodos.filter(todo => {
            const todoDate = new Date(todo.start_date);
            return todoDate >= startDate && todoDate <= endDate;
          });
          return todosForThreeDays;
        } catch (error) {
          console.error('Error fetching todos for three days:', error);
          return [];
        }
      };
      
      const fetchMeetingsForThreeDays = async (startDate: Date, endDate: Date) => {
        try {
          const fetchedMeetings = await fetchMeetingsAsTodos(user_id); // Assuming fetchMeetingsAsTodos retrieves meetings for the current user
          const meetingsForThreeDays = fetchedMeetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate >= startDate && meetingDate <= endDate;
          });
          return meetingsForThreeDays;
        } catch (error) {
          console.error('Error fetching meetings for three days:', error);
          return [];
        }
      };
      
      const generateAvailableTimePrompt = (todos: Todo[], meetings: Meeting_Todo[]) => {
        // Logic to calculate available time based on todos and meetings
        // You can implement your own logic here based on your application's requirements
        const totalTodosTime = todos.reduce((acc, todo) => {
          const startTime = new Date(todo.start_date);
          const endTime = new Date(todo.end_date);
          return acc + (endTime.getTime() - startTime.getTime());
        }, 0);
      
        const totalMeetingsTime = meetings.reduce((acc, meeting) => {
          // Assuming meetings have a default duration of 2 hours (or 120 minutes)
          return acc + 120 * 60 * 1000; // Convert 120 minutes to milliseconds
        }, 0);
      
        const availableTime = totalTodosTime - totalMeetingsTime;
        const availableTimeHours = availableTime / (60 * 60 * 1000); // Convert milliseconds to hours
      
        return `Based on your schedule for the next three days, you have approximately ${availableTimeHours.toFixed(1)} hours of available time. Please enter your estimated duration (in hours):`;
      };
      

    const loadTodos = async () => {
        try {
            setLoading(true);
            const fetchedTodos = await fetchTodos(user_id);
            const fetchedMeetings = await fetchMeetingsAsTodos(user_id);
            setTodos(fetchedTodos);
            setMeetings(fetchedMeetings);
        } catch (error) {
            console.error('Error loading todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTodoItem = async (id: string) => {
        try {
            await deleteTodo(id);
            const updatedTodos = todos.filter(todo => todo.todo_id !== id);
            setTodos(updatedTodos);
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const renderCalendar = (year: number, month: number) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDayIndex = new Date(year, month, daysInMonth).getDay();
        const prevDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const nextDays = lastDayIndex === 0 ? 0 : 7 - lastDayIndex;
    
        let calendarRows = [];
        let dayCount = 1;
    
        for (let week = 0; week < 6; week++) {
            let weekDays = [];
    
            for (let day = 0; day < 7; day++) {
                if ((week === 0 && day < prevDays) || (dayCount > daysInMonth)) {
                    weekDays.push(<div key={`empty-${week}-${day}`} className="calendar-day empty" />);
                } else {
                    const date = new Date(year, month, dayCount);
                    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const dayTodos = todos?.filter(todo => {
                        const todoDate = new Date(todo.start_date);
                        const todoDateString = `${todoDate.getFullYear()}-${String(todoDate.getMonth() + 1).padStart(2, '0')}-${String(todoDate.getDate()).padStart(2, '0')}`;
                        return todoDateString === dateString;
                    }) || [];

                    const dayMeetings = meetings?.filter(meeting =>{
                        const meentingDate = new Date(meeting.date);
                        const meentingDateString = `${meentingDate.getFullYear()}-${String(meentingDate.getMonth() + 1).padStart(2, '0')}-${String(meentingDate.getDate()).padStart(2, '0')}`;
                        return meentingDateString === dateString;
                    }) || [];
    
                    weekDays.push(
                        <div
                            key={`day-${dayCount}`}
                            className="calendar-day"
                            onClick={() => openModal(dateString)}
                        >
                            <div className="day-number">{dayCount}</div>
                            {dayTodos.map(todo => (
                                <div key={todo.todo_id} className="todo">{todo.title}</div>
                            ))}
                            {dayMeetings.map(meeting => (
                                <div key={meeting.meeting_id} className="meeting">{meeting.title}</div>
                            ))}
                        </div>
                    );
                    dayCount++;
                }
            }
    
            calendarRows.push(<div key={`week-${week}`} className="calendar-row">{weekDays}</div>);
            
            if (dayCount > daysInMonth) break;
        }
    
        return (
            <div className="calendar-grid">
                <div className="calendar-row">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="calendar-header">{day}</div>
                    ))}
                </div>
                {calendarRows}
            </div>
        );
    };

    const openModal = (date: string) => {
        const modal = document.getElementById('modal');
        const modalDate = document.getElementById('modal-date');
        const modalTodos = document.getElementById('modal-todos');

        if (modal && modalDate && modalTodos) {
            modal.style.display = 'block';
            modalDate.textContent = date;
            modalTodos.innerHTML = '';

            modalTodos.style.minHeight = '200px';

            const dayTodos = todos?.filter(todo => {
                const todoDate = new Date(todo.start_date);
                const todoDateString = `${todoDate.getFullYear()}-${String(todoDate.getMonth() + 1).padStart(2, '0')}-${String(todoDate.getDate()).padStart(2, '0')}`;
                return todoDateString === date;
            }) || [];

            const dayMeetings = meetings?.filter(meeting =>{
                const meentingDate = new Date(meeting.date);
                const meentingDateString = `${meentingDate.getFullYear()}-${String(meentingDate.getMonth() + 1).padStart(2, '0')}-${String(meentingDate.getDate()).padStart(2, '0')}`;
                return meentingDateString === date;
            }) || [];
            
            // todos
            dayTodos.forEach((todo, index) => {
                const todoElement = document.createElement('div');
                todoElement.classList.add('todo');

                const firstLine = document.createElement('div');
                firstLine.classList.add('first-line');
                firstLine.style.display = 'flex';
                firstLine.style.padding = '0px 5px';

                const todoNameText = document.createElement('div');
                const start_date = new Date(todo.start_date);
                const end_date = new Date(todo.end_date);
                todoNameText.textContent = `${todo.title} (${String(start_date.getHours()).padStart(2, '0')}:${String(start_date.getMinutes()).padStart(2, '0')} - ${String(end_date.getHours()).padStart(2, '0')}:${String(end_date.getMinutes()).padStart(2, '0')})`;

                todoNameText.style.textAlign = 'left';
                todoNameText.style.flexGrow = '1';
                
                // 创建删除按钮
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button'; // 根据需要添加样式类
                deleteButton.style.marginLeft = '10px'; // 设置适当的间距
                deleteButton.onclick = async () => {
                    try {
                        setLoading(true); // 设置 loading 状态为 true
                        await deleteTodoItem(todo.todo_id); // 调用删除 todo 的函数
                        modal.style.display = 'none'; // 隐藏模态框
                    } catch (error) {
                        console.error('Error deleting todo:', error); // 处理删除失败的错误
                    } finally {
                        setLoading(false); // 最终设置 loading 状态为 false
                    }
                };

                // 创建删除图标
                const deleteIcon = document.createElement('span');
                deleteIcon.className = 'delete-icon'; // 根据需要添加样式类
                deleteIcon.innerHTML = `
                <svg t="1719515589161" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2387" width="24" height="24"><path d="M511.32 108.71c206.36 0.27 379 156.8 399.37 362.14S792.62 863.62 590.35 904.47s-402.61-78.15-463.51-275.31 37.43-408.41 227.52-488.75a400.92 400.92 0 0 1 157-31.7m0-43.07C264.81 65.64 65 265.48 65 512s199.81 446.35 446.32 446.35S957.68 758.52 957.68 512 757.85 65.64 511.32 65.64z m0 0" p-id="2388"></path><path d="M494.09 702.68a45 45 0 0 1-31.44-12.81L316.36 547a45 45 0 1 1 62.88-64.38l112.47 109.84 191.41-216.32a45 45 0 1 1 67.4 59.63L527.79 687.5a45 45 0 0 1-32.06 15.15z" p-id="2389"></path></svg>
            `;

                // 将删除图标添加到删除按钮中
                deleteButton.appendChild(deleteIcon);

                // 将 todo 名称和删除按钮添加到第一行元素中
                firstLine.appendChild(todoNameText);
                firstLine.appendChild(deleteButton);

                const progressContainer = document.createElement('div');
                progressContainer.classList.add('progress-container');

                const progressInput = document.createElement('input');
                progressInput.type = 'range';
                progressInput.min = '0';
                progressInput.max = '100';
                progressInput.value = `${todo.progress ?? 0}`;
                progressInput.classList.add('progress-bar');

                const progressText = document.createElement('span');
                progressText.textContent = `${todo.progress ?? 0}` + '%';
                progressText.style.marginLeft = '5px';

                progressInput.addEventListener('input', async () => {
                    progressText.textContent = `${progressInput.value}%`;
                    todo.progress = parseInt(progressInput.value);
                    setLoading(true);
                    await createOrUpdateTodo({
                        todo_id: todo.todo_id,
                        title: todo.title,
                        start_date: todo.start_date,
                        end_date: todo.end_date,
                        progress: parseInt(progressInput.value),
                        user_id: user_id
                    });
                    setLoading(false);
                });

                progressContainer.appendChild(progressInput);
                progressContainer.appendChild(progressText);

                todoElement.appendChild(firstLine);
                todoElement.appendChild(progressContainer);

                modalTodos.appendChild(todoElement);
            });       
            
            // meetings
            dayMeetings.forEach((meeting, index) => {
                const MeetingElement = document.createElement('div');
                MeetingElement.classList.add('meeting');
                // title
                const titleElement = document.createElement('div');
                titleElement.textContent = meeting.title;
                titleElement.style.textAlign = 'left';
                titleElement.style.flexGrow = '1';
                // status
                const statusElement = document.createElement('div');
                statusElement.classList.add('meeting-status');
                statusElement.style.textAlign = 'left';
                statusElement.style.marginTop = '6px';
                statusElement.style.marginBottom = '6px';
                ReactDOM.render(<MeetingStatus status={meeting.status} />, statusElement);

                MeetingElement.appendChild(titleElement);
                MeetingElement.appendChild(statusElement);

                modalTodos.appendChild(MeetingElement);
            });
        }
    };

    const closeModal = () => {
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentMonth(newDate);
    };

    return (
        <div className="calendar-page">
            <div className="calendar-controls flex items-center justify-between gap-4">
                <PreviousMonthButton onClick={() => changeMonth(-1)} />
                <span id="current-month" className={`${lusitana.className} text-2xl`}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <NextMonthButton onClick={() => changeMonth(1)} />
            </div>
            <div id="calendar-grid" className="calendar-grid">
                {loading ? (
                    <Suspense fallback={<CalendarSkeleton />}>
                    <CalendarSkeleton />
                </Suspense>
                ) : (
                    renderCalendar(currentMonth.getFullYear(), currentMonth.getMonth())
                )}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    placeholder="Todo Title"
                    className="peer h-12 block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                />
                {/* start_time */}
                <div className="relative">
                    <input
                        id="start_date"
                        name="date"
                        type="datetime-local"
                        value={newTodo.start_date}
                        onChange={(e) => setNewTodo({ ...newTodo, start_date: e.target.value })}
                        className="peer h-12 block w-full rounded-md border border-gray-200 p-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        aria-describedby="date-error"
                    />
                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                </div>
                {/* end_time */}
                <div className="relative">
                    <input
                        id="end_date"
                        name="date"
                        type="datetime-local"
                        value={newTodo.end_date}
                        onChange={(e) => setNewTodo({ ...newTodo, end_date: e.target.value })}
                        className="peer h-12 block w-full rounded-md border border-gray-200 p-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        aria-describedby="date-error"
                    />
                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                </div>
                <AddEventButton onClick={handleAddTodo} />
                {/* <QuickPlanButton onClick={() => alert('QuickPlan')} /> */}
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    className="flex h-12 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    >
                    <span className="hidden md:block md:mr-2 font-bold">QuickPlan</span>{' '}
                    <CalendarIconInput className="ml-2 h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 space-y-4">
                <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Slider
                        id="duration"
                        min={15}
                        max={240}
                        step={15}
                        value={[duration]}
                        onValueChange={setDuration}
                        className="w-full"
                        />
                        <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{duration} minutes</span>
                        <Button
                            variant="outline"
                            onClick={() => {
                            // alert(`Plan a ${duration} minute event`);
                            handleQuickPlan();
                            // setNewTodo({ title: 'Something todo', start_date: '2024-06-30 10:00', end_date: '2024-06-30 12:00'});
                            }}
                        >
                            Plan
                        </Button>
                        </div>
                    </div>
                </PopoverContent>
                </Popover>
            </div>


            {/* Modal */}
            <div id="modal" className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <h2 id="modal-date"></h2>
                    <div id="modal-todos"></div>
                </div>
            </div>
        </div>
    );
};

function CalendarIconInput(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )
  }