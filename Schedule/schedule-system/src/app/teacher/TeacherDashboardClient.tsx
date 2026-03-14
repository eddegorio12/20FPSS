'use client';

import { useState } from 'react';
import { SignOutButton } from '@/components/SignOutButton';
import { format } from 'date-fns';
import TeacherCalendarView from '@/components/TeacherCalendarView';

type TeacherDashboardClientProps = {
  userName: string | null;
  schedules: any[];
};

export default function TeacherDashboardClient({ userName, schedules }: TeacherDashboardClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-blue-600">My Schedules</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">{userName}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <div className="bg-white rounded-md shadow-sm inline-flex p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 text-sm font-medium rounded ${
                viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 text-sm font-medium rounded ${
                viewMode === 'calendar' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No schedules assigned yet.</p>
            <p className="text-sm mt-1">Contact your admin to get schedules assigned.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(s.date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(s.startTime), 'h:mm a')} – {format(new Date(s.endTime), 'h:mm a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.section.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {s.topic.name}{s.topicPart ? ` – ${s.topicPart.name}` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.roomNumber ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TeacherCalendarView schedules={schedules} />
        )}
      </main>
    </div>
  );
}
