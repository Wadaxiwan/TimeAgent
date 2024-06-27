"use client";

import React, { useState, useEffect, Suspense } from 'react';
import '@/app/ui/calendar/calendar.css';
import { lusitana } from '@/app/ui/fonts';
import { PreviousMonthButton, NextMonthButton, AddEventButton } from '@/app/ui/calendar/buttons';
import { Todo, fetchTodos, createOrUpdateTodo, deleteTodo } from '@/app/lib/actions';
import CalendarSkeleton from '@/app/ui/calendar/skeletons';

const CalendarPage = () => {
    const [todos, setTodos] = useState<Todo[] | null>(null);
    const [newTodo, setNewTodo] = useState({ title: '', date: '' });
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodos();
    }, []);

    useEffect(() => {
        if (todos) {
            renderCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
        }
    }, [currentMonth, todos]);

    const handleAddTodo = async () => {
        if (newTodo.title && newTodo.date) {
            try {
                setLoading(true);
                const createdTodo = await createOrUpdateTodo(newTodo);
                setTodos([...todos, ...createdTodo]);
                setNewTodo({ title: '', date: '' });
            } catch (error) {
                console.error('Error adding todo:', error);
            } finally {
                setLoading(false);
            }
        } else {
            alert('Please enter both title and date.');
        }
    };

    const loadTodos = async () => {
        try {
            setLoading(true);
            const fetchedTodos = await fetchTodos();
            setTodos(fetchedTodos);
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
                        const todoDate = new Date(todo.date);
                        const todoDateString = `${todoDate.getFullYear()}-${String(todoDate.getMonth() + 1).padStart(2, '0')}-${String(todoDate.getDate()).padStart(2, '0')}`;
                        return todoDateString === dateString;
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
                const todoDate = new Date(todo.date);
                const todoDateString = `${todoDate.getFullYear()}-${String(todoDate.getMonth() + 1).padStart(2, '0')}-${String(todoDate.getDate()).padStart(2, '0')}`;
                return todoDateString === date;
            }) || [];
            dayTodos.forEach((todo, index) => {
                const todoElement = document.createElement('div');
                todoElement.classList.add('todo');

                const firstLine = document.createElement('div');
                firstLine.classList.add('first-line');
                firstLine.style.display = 'flex';
                firstLine.style.padding = '0px 5px';

                const todoNameText = document.createElement('div');
                todoNameText.textContent = todo.title;
                todoNameText.style.textAlign = 'left';
                todoNameText.style.flexGrow = '1';

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Done';
                deleteButton.style.marginLeft = '10px';
                deleteButton.onclick = async () => {
                    try {
                        setLoading(true);
                        await deleteTodoItem(todo.todo_id);
                        modal.style.display = 'none';
                    } catch (error) {
                        console.error('Error deleting todo:', error);
                    } finally {
                        setLoading(false);
                    }
                };

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
                        date: todo.date,
                        progress: parseInt(progressInput.value)
                    });
                    setLoading(false);
                });

                progressContainer.appendChild(progressInput);
                progressContainer.appendChild(progressText);

                todoElement.appendChild(firstLine);
                todoElement.appendChild(progressContainer);

                modalTodos.appendChild(todoElement);
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
            <div className="todo-form mt-4 flex items-center justify-center gap-2">
                <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    placeholder="Todo Title"
                    className="input"
                />
                <input
                    type="date"
                    value={newTodo.date}
                    onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
                    className="input"
                />
                <AddEventButton onClick={handleAddTodo} />
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

export default CalendarPage;
