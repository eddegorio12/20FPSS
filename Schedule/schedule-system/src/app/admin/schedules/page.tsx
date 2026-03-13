'use client';

import { useState, useEffect } from 'next';
import Link from 'next/link';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedules')
      .then(res => res.json())
      .then(data => {
        setSchedules(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Schedules</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          + New Schedule
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sync</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
            ) : schedules.map((s: any) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {new Date(s.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{s.teacher?.user?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{s.section?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.topic?.name} {s.topicPart ? `(${s.topicPart.name})` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${s.syncStatus === 'SYNCED' ? 'bg-green-100 text-green-800' : s.syncStatus === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {s.syncStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
