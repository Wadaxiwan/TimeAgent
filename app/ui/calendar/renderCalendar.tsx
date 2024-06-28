import React from 'react';
import { Todo } from '@/app/lib/actions';

interface RenderCalendarProps {
    year: number;
    month: number;
    todos: Todo[];
    openModal: (date: string) => void;
}

const RenderCalendar: React.FC<RenderCalendarProps> = ({ year, month, todos, openModal }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDayIndex = new Date(year, month, daysInMonth).getDay();
    const prevDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const nextDays = lastDayIndex === 0 ? 0 : 7 - lastDayIndex;

    let calendarRows = [];
    let dayCount = 1;

    // Render weeks and days
    for (let week = 0; week < 6; week++) { // Assuming a maximum of 6 weeks
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
        
        // If all days are rendered, break out of the loop
        if (dayCount > daysInMonth) break;
    }

    return (
        <div className="calendar-grid">
            {/* Week days */}
            <div className="calendar-row">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="calendar-header">{day}</div>
                ))}
            </div>

            {/* Render calendar rows */}
            {calendarRows}
        </div>
    );
};

export default RenderCalendar;
