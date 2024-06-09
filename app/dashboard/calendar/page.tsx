"use client";

import React, { useState, useEffect } from 'react';
import './calendar.css';

interface Event {
    title: string;
    date: string;
}

const CalendarPage = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [newEvent, setNewEvent] = useState<Event>({ title: '', date: '' });
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        loadEvents();
    }, []);

    const handleAddEvent = () => {
        if (newEvent.title && newEvent.date) {
            const updatedEvents = [...events, newEvent];
            setEvents(updatedEvents);
            localStorage.setItem('events', JSON.stringify(updatedEvents));
            setNewEvent({ title: '', date: '' });
            renderCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
        } else {
            alert('Please enter both title and date.');
        }
    };

    const loadEvents = () => {
        const storedEvents = localStorage.getItem('events');
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
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
        loadEvents();
    };

    const renderWeekDays = (calendar: HTMLElement) => {
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
            calendar.appendChild(dayElement);
        }
    };

    const openModal = (date: string) => {
        const modal = document.getElementById('modal');
        const modalDate = document.getElementById('modal-date');
        const modalEvents = document.getElementById('modal-events');

        if (modal && modalDate && modalEvents) {
            modal.style.display = 'block';
            modalDate.textContent = date;
            modalEvents.innerHTML = '';

            const dayEvents = events.filter(event => event.date === date);
            dayEvents.forEach((event, index) => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('event');
                eventElement.textContent = event.title;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteEvent(date, index);
                eventElement.appendChild(deleteButton);

                modalEvents.appendChild(eventElement);
            });
        }
    };

    const deleteEvent = (date: string, eventIndex: number) => {
        const dayEvents = events.filter(event => event.date === date);
        const eventToRemove = dayEvents[eventIndex];
        const updatedEvents = events.filter(event => !(event.date === eventToRemove.date && event.title === eventToRemove.title));
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
        closeModal();
        renderCalendar(new Date(date).getFullYear(), new Date(date).getMonth());
    };

    const closeModal = () => {
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentMonth(newDate);
        renderCalendar(newDate.getFullYear(), newDate.getMonth());
    };

    useEffect(() => {
        renderCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
    }, [currentMonth]);

    return (
        <div className="calendar-page">
            <h1>Event Calendar</h1>
            <div className="calendar-controls">
                <button onClick={() => changeMonth(-1)}>Previous</button>
                <span id="current-month">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)}>Next</button>
            </div>
            <div id="calendar-grid" className="calendar-grid"></div>
            <div className="event-form">
                <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event Title"
                />
                <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <button onClick={handleAddEvent}>Add Event</button>
            </div>

            {/* Modal */}
            <div id="modal" className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <h2 id="modal-date"></h2>
                    <div id="modal-events"></div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
