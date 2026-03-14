'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Schedule = any; // Adjust type as needed

export default function TeacherCalendarView({ schedules }: { schedules: Schedule[] }) {
  const events = schedules.map(s => ({
    id: s.id,
    title: `[${s.section?.name}] ${s.topic?.name}`,
    start: s.startTime,
    end: s.endTime,
    extendedProps: {
      room: s.roomNumber,
      topicPart: s.topicPart?.name,
    },
    backgroundColor: '#4f46e5', // Indigo-600
    borderColor: 'transparent',
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="w-full gc-container" style={{ minHeight: '600px' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          eventContent={(arg) => (
            <div className="p-1 overflow-hidden leading-tight text-xs">
              <div className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                {arg.event.title}
              </div>
              {arg.event.extendedProps.room && (
                <div className="opacity-90 whitespace-nowrap overflow-hidden text-ellipsis">
                  Rm: {arg.event.extendedProps.room}
                </div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
