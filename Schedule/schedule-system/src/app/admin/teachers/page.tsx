'use client';

import { useState, useEffect } from 'react';

type Teacher = {
  id: string;
  userId: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  _count: {
    schedules: number;
  };
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add state
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');

  // Edit state
  const [editingTeacher, setEditingTeacher] = useState<{ id: string; name: string; email: string } | null>(null);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) return;

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeacherName, email: newTeacherEmail }),
      });
      if (res.ok) {
        setNewTeacherName('');
        setNewTeacherEmail('');
        fetchTeachers();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editingTeacher.name.trim() || !editingTeacher.email.trim()) return;

    try {
      const res = await fetch(`/api/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingTeacher.name, email: editingTeacher.email }),
      });
      if (res.ok) {
        setEditingTeacher(null);
        fetchTeachers();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      alert(`Cannot delete teacher because they have ${count} assigned schedules.`);
      return;
    }
    if (!confirm('Are you sure you want to delete this teacher permanently?')) return;
    
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTeachers();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (teacher: Teacher) => {
    setEditingTeacher({
      id: teacher.id,
      name: teacher.user.name || '',
      email: teacher.user.email || '',
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Add New Teacher</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={newTeacherEmail}
              onChange={(e) => setNewTeacherEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Add Teacher
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Load
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No teachers found. Add one above.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4">
                    {editingTeacher?.id === teacher.id ? (
                      <form id={`edit-form-${teacher.id}`} onSubmit={handleUpdate} className="space-y-2">
                        <input
                          type="text"
                          value={editingTeacher.name}
                          onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="email"
                          value={editingTeacher.email}
                          onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </form>
                    ) : (
                      <div className="flex items-center">
                        {teacher.user.image ? (
                          <img src={teacher.user.image} alt={teacher.user.name || ''} className="h-10 w-10 rounded-full mr-3" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                            {teacher.user.name?.charAt(0) || teacher.user.email?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{teacher.user.name}</div>
                          <div className="text-sm text-gray-500">{teacher.user.email}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {teacher._count.schedules} Schedules
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingTeacher?.id === teacher.id ? (
                      <div className="flex justify-end gap-3">
                        <button type="submit" form={`edit-form-${teacher.id}`} className="text-green-600 hover:text-green-900">Save</button>
                        <button type="button" onClick={() => setEditingTeacher(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => startEdit(teacher)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id, teacher._count.schedules)}
                          className={`hover:text-red-900 ${teacher._count.schedules > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'}`}
                          title={teacher._count.schedules > 0 ? "Cannot delete teacher with assigned schedules." : "Delete Teacher"}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
