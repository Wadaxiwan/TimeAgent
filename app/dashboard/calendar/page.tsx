"use client";

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';

export default function CalendarPage() {
    const [events, setEvents] = useState<{ [date: string]: string[] }>({});
    const [newEvent, setNewEvent] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleAddEvent = () => {
        if (selectedDate && newEvent) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const updatedEvents = { ...events };
            if (!updatedEvents[dateStr]) {
                updatedEvents[dateStr] = [];
            }
            updatedEvents[dateStr].push(newEvent);
            setEvents(updatedEvents);
            setNewEvent('');
        }
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        const dateStr = date.toISOString().split('T')[0];
        return (
            <div>
                {events[dateStr]?.map((event, index) => (
                    <div key={index} className="event">
                        {event}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="calendar-page">
            <h1 className="text-2xl font-bold mb-4">Event Calendar</h1>
            <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={tileContent}
            />
            <div className="event-form mt-4 flex items-center justify-center gap-2">
                <input
                    type="text"
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    placeholder="Event Title"
                    className="input"
                />
                <input
                    type="date"
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="input"
                />
                <button onClick={handleAddEvent} className="btn">
                    Add Event
                </button>
            </div>
        </div>
    );
}
