'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AdminCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch a large limit for calendar view (or implement active start/end date fetching later)
    fetch('/api/schedules?limit=500')
      .then(res => res.json())
      .then(data => {
        const schedules = data.schedules || [];
        
        // Map backend schedules to FullCalendar event format
        const calendarEvents = schedules.map((s: any) => ({
          id: s.id,
          title: `[${s.section?.name}] ${s.topic?.name} - ${s.teacher?.user?.name || 'Unknown'}`,
          start: s.startTime,
          end: s.endTime,
          extendedProps: {
            room: s.roomNumber,
            topicPart: s.topicPart?.name,
            syncStatus: s.syncStatus,
          },
          // Color code by sync status
          backgroundColor: s.syncStatus === 'SYNCED' ? '#059669' : s.syncStatus === 'FAILED' ? '#dc2626' : '#d97706',
          borderColor: 'transparent',
        }));

        setEvents(calendarEvents);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load schedules for calendar", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Calendar</h1>
          <p className="text-gray-600 mt-1">View all plotted schedules across the system.</p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#059669]"></span> Synced</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#d97706]"></span> Pending</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#dc2626]"></span> Failed</div>
        </div>
      </div>

      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">Loading Calendar...</div>
        ) : (
          <div className="h-full w-full gc-container" style={{ minHeight: '600px' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              height="100%"
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
        )}
      </div>
    </div>
  );
}
