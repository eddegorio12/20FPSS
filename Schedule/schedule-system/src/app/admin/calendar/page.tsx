'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../../calendar-theme.css';

// Google Calendar–inspired color palette for teachers
const TEACHER_COLORS = [
  '#1a73e8', // Blue
  '#d50000', // Tomato
  '#e67c73', // Flamingo
  '#f4511e', // Tangerine
  '#33b679', // Sage
  '#0b8043', // Basil
  '#039be5', // Peacock
  '#7986cb', // Lavender
  '#8e24aa', // Grape
  '#616161', // Graphite
];

function getTeacherColor(teacherId: string, teacherMap: Map<string, number>) {
  if (!teacherMap.has(teacherId)) {
    teacherMap.set(teacherId, teacherMap.size);
  }
  return TEACHER_COLORS[teacherMap.get(teacherId)! % TEACHER_COLORS.length];
}

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
  teacher: string;
  section: string;
  topic: string;
  topicPart: string | null;
  room: string | null;
  syncStatus: string;
  color: string;
  x: number;
  y: number;
} | null;

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popover, setPopover] = useState<PopoverData>(null);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    const teacherColorMap = new Map<string, number>();

    fetch('/api/schedules?limit=500')
      .then(res => res.json())
      .then(data => {
        const schedules = data.schedules || [];

        const calendarEvents = schedules.map((s: any) => {
          const dateOnly = new Date(s.date).toISOString().split('T')[0];
          const startTimeOnly = new Date(s.startTime).toISOString().split('T')[1];
          const endTimeOnly = new Date(s.endTime).toISOString().split('T')[1];
          const teacherId = s.teacher?.id || 'unknown';
          const color = getTeacherColor(teacherId, teacherColorMap);

          return {
            id: s.id,
            title: s.topic?.name || 'Untitled',
            start: `${dateOnly}T${startTimeOnly}`,
            end: `${dateOnly}T${endTimeOnly}`,
            backgroundColor: color,
            borderColor: 'transparent',
            extendedProps: {
              teacher: s.teacher?.user?.name || 'Unknown',
              section: s.section?.name || '',
              topic: s.topic?.name || '',
              topicPart: s.topicPart?.name || null,
              room: s.roomNumber,
              syncStatus: s.syncStatus,
              color,
            },
          };
        });

        setEvents(calendarEvents);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load schedules', err);
        setLoading(false);
      });
  }, []);

  const handleEventClick = useCallback((info: any) => {
    const rect = info.el.getBoundingClientRect();
    const ep = info.event.extendedProps;
    const startStr = formatEventTime(info.event.startStr);
    const endStr = formatEventTime(info.event.endStr);

    // Position popover: try right of event, fall back to left
    let x = rect.right + 8;
    let y = rect.top;
    if (x + 320 > window.innerWidth) x = rect.left - 328;
    if (y + 300 > window.innerHeight) y = window.innerHeight - 310;
    if (y < 8) y = 8;

    setPopover({
      title: info.event.title,
      time: `${startStr} – ${endStr}`,
      teacher: ep.teacher,
      section: ep.section,
      topic: ep.topic,
      topicPart: ep.topicPart,
      room: ep.room,
      syncStatus: ep.syncStatus,
      color: ep.color,
      x,
      y,
    });
  }, []);

  const closePopover = useCallback(() => setPopover(null), []);

  const syncBadgeClass = (status: string) => {
    if (status === 'SYNCED') return 'gc-sync-badge gc-sync-badge--synced';
    if (status === 'FAILED') return 'gc-sync-badge gc-sync-badge--failed';
    return 'gc-sync-badge gc-sync-badge--pending';
  };

  const syncLabel = (status: string) => {
    if (status === 'SYNCED') return '✓ Synced';
    if (status === 'FAILED') return '✕ Failed';
    return '● Pending';
  };

  return (
    <div className="gc-calendar" style={{ height: 'calc(100vh - 48px)' }}>
      {loading ? (
        <div className="gc-calendar-loading">
          <div className="gc-spinner" />
          <span style={{ fontSize: '0.875rem' }}>Loading schedules…</span>
        </div>
      ) : (
        <div style={{ height: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(60,64,67,0.15)' }}>
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
            height="100%"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            nowIndicator={true}
            dayMaxEventRows={3}
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
        </div>
      )}

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
                {popover.topic}
                {popover.topicPart && <span style={{ fontWeight: 300, fontSize: '0.875rem', color: '#70757a' }}> – {popover.topicPart}</span>}
              </div>

              <div className="gc-popover-row">
                <span className="gc-row-icon">🕐</span>
                <div className="gc-row-content">{popover.time}</div>
              </div>

              <div className="gc-popover-row">
                <span className="gc-row-icon">👤</span>
                <div className="gc-row-content">
                  {popover.teacher}
                  <div className="gc-row-label">Teacher</div>
                </div>
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

              <div className="gc-popover-row" style={{ marginTop: 4 }}>
                <span className="gc-row-icon">☁</span>
                <div className="gc-row-content">
                  <span className={syncBadgeClass(popover.syncStatus)}>
                    {syncLabel(popover.syncStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
