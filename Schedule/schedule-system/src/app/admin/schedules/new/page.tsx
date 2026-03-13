'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [sections, setSections] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    sectionName: '',
    topicName: '',
    topicPartName: '',
    teacherEmail: '',
    roomNumber: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const secRes = await fetch('/api/sections');
        const sec = await secRes.json();
        setSections(sec);

        const topRes = await fetch('/api/topics');
        const top = await topRes.json();
        setTopics(top);

        const teaRes = await fetch('/api/teachers');
        const tea = await teaRes.json();
        setTeachers(tea);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topicPartName: formData.topicPartName || undefined,
          roomNumber: formData.roomNumber || undefined,
        })
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      router.push('/admin/schedules');
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  const selectedTopic = topics.find(t => t.name === formData.topicName);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-6">Create New Schedule</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" required className="w-full border rounded p-2"
              value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Room</label>
            <input type="text" className="w-full border rounded p-2" placeholder="Optional"
              value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input type="time" required className="w-full border rounded p-2"
              value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input type="time" required className="w-full border rounded p-2"
              value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teacher Email</label>
          <input type="email" required className="w-full border rounded p-2" placeholder="e.g. teacher@example.com"
            list="teachers-list"
            value={formData.teacherEmail} onChange={e => setFormData({...formData, teacherEmail: e.target.value})} />
          <datalist id="teachers-list">
            {teachers.map(t => (
              <option key={t.id} value={t.user?.email}>{t.user?.name}</option>
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Section Name</label>
          <input type="text" required className="w-full border rounded p-2" placeholder="e.g. Grade 10-A"
            list="sections-list"
            value={formData.sectionName} onChange={e => setFormData({...formData, sectionName: e.target.value})} />
          <datalist id="sections-list">
            {sections.map(s => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Topic Name</label>
            <input type="text" required className="w-full border rounded p-2" placeholder="e.g. Mathematics"
              list="topics-list"
              value={formData.topicName} onChange={e => setFormData({...formData, topicName: e.target.value, topicPartName: ''})} />
            <datalist id="topics-list">
              {topics.map(t => (
                <option key={t.id} value={t.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Topic Part (Optional)</label>
            <input type="text" className="w-full border rounded p-2" placeholder="e.g. Algebra"
              list="parts-list"
              value={formData.topicPartName} onChange={e => setFormData({...formData, topicPartName: e.target.value})} />
            <datalist id="parts-list">
              {selectedTopic?.topicParts?.map((p: any) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
