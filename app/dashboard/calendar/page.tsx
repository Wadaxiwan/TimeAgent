"use client";

import React, { useState, useEffect } from 'react';
import './calendar.css';
import { lusitana } from '@/app/ui/fonts';
import { PreviousMonthButton, NextMonthButton, AddEventButton } from '@/app/ui/calendar/buttons';

interface Todo {
    title: string;
    date: string;
}

const CalendarPage = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState<Todo>({ title: '', date: '' });
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        loadTodos();
    }, []);

    useEffect(() => {
        renderCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
    }, [currentMonth, todos]);

    const handleAddTodo = () => {
        if (newTodo.title && newTodo.date) {
            const updatedTodos = [...todos, newTodo];
            setTodos(updatedTodos);
            localStorage.setItem('todos', JSON.stringify(updatedTodos));
            setNewTodo({ title: '', date: '' });
        } else {
            alert('Please enter both title and date.');
        }
    };

    const loadTodos = () => {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos));
        }
    };

    const renderCalendar = (year: number, month: number) => {
        const calendar = document.getElementById('calendar-grid');
        if (!calendar) return;

        calendar.innerHTML = '';

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDayIndex = new Date(year, month, daysInMonth).getDay();
        const prevDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const nextDays = lastDayIndex === 0 ? 0 : 7 - lastDayIndex;

        renderWeekDays(calendar);
        renderEmptyDays(calendar, prevDays);
        renderMonthDays(calendar, year, month, daysInMonth);
        renderEmptyDays(calendar, nextDays);
    };

    const renderWeekDays = (calendar: HTMLElement) => {
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        weekDays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-header');
            dayElement.textContent = day;
            calendar.appendChild(dayElement);
        });
    };

    const renderEmptyDays = (calendar: HTMLElement, count: number) => {
        for (let i = 0; i < count; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day', 'empty');
            calendar.appendChild(dayElement);
        }
    };

    const renderMonthDays = (calendar: HTMLElement, year: number, month: number, daysInMonth: number) => {
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = day.toString();
            dayElement.setAttribute('data-date', `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
            dayElement.onclick = () => openModal(dayElement.getAttribute('data-date')!);

            // 添加待办事项到日历日期下方
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTodos = todos.filter(todo => todo.date === dateString);
            dayTodos.forEach(todo => {
                const todoElement = document.createElement('div');
                todoElement.classList.add('todo');
                todoElement.textContent = todo.title;
                dayElement.appendChild(todoElement);
            });

            calendar.appendChild(dayElement);
        }
    };

    const openModal = (date: string) => {
        const modal = document.getElementById('modal');
        const modalDate = document.getElementById('modal-date');
        const modalTodos = document.getElementById('modal-todos');

        if (modal && modalDate && modalTodos) {
            modal.style.display = 'block';
            modalDate.textContent = date;
            modalTodos.innerHTML = '';

            const dayTodos = todos.filter(todo => todo.date === date);
            dayTodos.forEach((todo, index) => {
                const todoElement = document.createElement('div');
                todoElement.classList.add('todo');
                todoElement.textContent = todo.title;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteTodo(date, index);
                todoElement.appendChild(deleteButton);

                modalTodos.appendChild(todoElement);
            });
        }
    };

    const deleteTodo = (date: string, todoIndex: number) => {
        const dayTodos = todos.filter(todo => todo.date === date);
        const todoToRemove = dayTodos[todoIndex];
        const updatedTodos = todos.filter(todo => !(todo.date === todoToRemove.date && todo.title === todoToRemove.title));
        setTodos(updatedTodos);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        closeModal();
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
            <div id="calendar-grid" className="calendar-grid"></div>
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
