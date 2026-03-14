'use client';

import { useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../app/calendar-theme.css';

type Schedule = any;

function formatEventTime(dateStr: string) {
  const d = new Date(dateStr);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return m ? `${h}:${m.toString().padStart(2, '0')} ${ampm}` : `${h} ${ampm}`;
}

type PopoverData = {
  title: string;
  time: string;
  section: string;
  topicPart: string | null;
  room: string | null;
  color: string;
  x: number;
  y: number;
} | null;

export default function TeacherCalendarView({ schedules }: { schedules: Schedule[] }) {
  const [popover, setPopover] = useState<PopoverData>(null);
  const calendarRef = useRef<any>(null);

  const events = schedules.map(s => {
    const dateOnly = new Date(s.date).toISOString().split('T')[0];
    const startTimeOnly = new Date(s.startTime).toISOString().split('T')[1];
    const endTimeOnly = new Date(s.endTime).toISOString().split('T')[1];

    return {
      id: s.id,
      title: s.topic?.name || 'Untitled',
      start: `${dateOnly}T${startTimeOnly}`,
      end: `${dateOnly}T${endTimeOnly}`,
      backgroundColor: '#1a73e8',
      borderColor: 'transparent',
      extendedProps: {
        section: s.section?.name || '',
        topicPart: s.topicPart?.name || null,
        room: s.roomNumber,
      },
    };
  });

  const handleEventClick = useCallback((info: any) => {
    const rect = info.el.getBoundingClientRect();
    const ep = info.event.extendedProps;
    const startStr = formatEventTime(info.event.startStr);
    const endStr = formatEventTime(info.event.endStr);

    let x = rect.right + 8;
    let y = rect.top;
    if (x + 320 > window.innerWidth) x = rect.left - 328;
    if (y + 250 > window.innerHeight) y = window.innerHeight - 260;
    if (y < 8) y = 8;

    setPopover({
      title: info.event.title,
      time: `${startStr} – ${endStr}`,
      section: ep.section,
      topicPart: ep.topicPart,
      room: ep.room,
      color: '#1a73e8',
      x,
      y,
    });
  }, []);

  const closePopover = useCallback(() => setPopover(null), []);

  return (
    <div className="gc-calendar" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(60,64,67,0.15)' }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
        events={events}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator={true}
        eventClick={handleEventClick}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }}
        dayHeaderFormat={{
          weekday: 'short',
          day: 'numeric',
          month: 'numeric',
          omitCommas: true,
        }}
        eventContent={(arg) => {
          const ep = arg.event.extendedProps;
          const startStr = arg.event.start ? formatEventTime(arg.event.startStr) : '';
          return (
            <div className="gc-event-content">
              <div className="gc-event-time">{startStr}</div>
              <div className="gc-event-title">{arg.event.title}</div>
              <div className="gc-event-subtitle">
                {ep.section}{ep.room ? ` · ${ep.room}` : ''}
              </div>
            </div>
          );
        }}
      />

      {/* Event Popover */}
      {popover && (
        <>
          <div className="gc-popover-overlay" onClick={closePopover} />
          <div
            className="gc-popover"
            style={{ left: popover.x, top: popover.y }}
          >
            <div className="gc-popover-header">
              <button onClick={closePopover} title="Close">✕</button>
            </div>
            <div className="gc-popover-body">
              <div className="gc-popover-title">
                <span className="gc-color-dot" style={{ background: popover.color }} />
                {popover.title}
                {popover.topicPart && <span style={{ fontWeight: 300, fontSize: '0.875rem', color: '#70757a' }}> – {popover.topicPart}</span>}
              </div>

              <div className="gc-popover-row">
                <span className="gc-row-icon">🕐</span>
                <div className="gc-row-content">{popover.time}</div>
              </div>

              <div className="gc-popover-row">
                <span className="gc-row-icon">📚</span>
                <div className="gc-row-content">
                  {popover.section}
                  <div className="gc-row-label">Section</div>
                </div>
              </div>

              {popover.room && (
                <div className="gc-popover-row">
                  <span className="gc-row-icon">📍</span>
                  <div className="gc-row-content">
                    {popover.room}
                    <div className="gc-row-label">Room</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
