'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/schedules?page=${page}&limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setSchedules(data.schedules || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        setError('Could not load schedules. Please refresh.');
        setLoading(false);
      });
  }, [page]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Schedules</h1>
        <Link href="/admin/schedules/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          + New Schedule
        </Link>
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
            {error ? (
              <tr><td colSpan={7} className="text-center py-4 text-red-600">{error}</td></tr>
            ) : loading ? (
              <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
            ) : schedules.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-4 text-gray-500">No schedules found.</td></tr>
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
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    &laquo; Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    Next &raquo;
                    <span className="sr-only">Next</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
