'use client';

import { useState, useEffect } from 'react';

type Section = { id: string; name: string };
type TopicPart = { id: string; name: string; topicId: string };
type Topic = { id: string; name: string; topicParts: TopicPart[] };

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<'sections' | 'topics'>('sections');
  
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Taxonomy Management</h1>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sections')}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'sections'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Sections
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'topics'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Topics
        </button>
      </div>

      {activeTab === 'sections' ? <SectionsManager /> : <TopicsManager />}
    </div>
  );
}

function SectionsManager() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sections');
      const data = await res.json();
      setSections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSectionName }),
      });
      if (res.ok) {
        setNewSectionName('');
        fetchSections();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.name.trim()) return;
    try {
      const res = await fetch(`/api/sections/${editingSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingSection.name }),
      });
      if (res.ok) {
        setEditingSection(null);
        fetchSections();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSections();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Add New Section</h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Section Name (e.g., 9-A)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Add Section
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : sections.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                  No sections found. Add one above.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingSection?.id === section.id ? (
                      <form onSubmit={handleUpdate} className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingSection.name}
                          onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button type="submit" className="text-green-600 hover:text-green-900 text-sm font-medium">Save</button>
                        <button type="button" onClick={() => setEditingSection(null)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
                      </form>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{section.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingSection?.id !== section.id && (
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setEditingSection(section)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="text-red-600 hover:text-red-900"
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

function TopicsManager() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add state
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicParts, setNewTopicParts] = useState<string[]>(['']);

  // Edit state
  const [editingTopic, setEditingTopic] = useState<{ id: string, name: string, parts: string[] } | null>(null);

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreatePartChange = (index: number, value: string) => {
    const updated = [...newTopicParts];
    updated[index] = value;
    setNewTopicParts(updated);
  };

  const handleEditPartChange = (index: number, value: string) => {
    if (!editingTopic) return;
    const updated = [...editingTopic.parts];
    updated[index] = value;
    setEditingTopic({ ...editingTopic, parts: updated });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    
    const parts = newTopicParts.filter(p => p.trim() !== '');

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTopicName, parts }),
      });
      if (res.ok) {
        setNewTopicName('');
        setNewTopicParts(['']);
        fetchTopics();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editingTopic.name.trim()) return;

    const parts = editingTopic.parts.filter(p => p.trim() !== '');

    try {
      const res = await fetch(`/api/topics/${editingTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingTopic.name, parts }),
      });
      if (res.ok) {
        setEditingTopic(null);
        fetchTopics();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTopics();
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (topic: Topic) => {
    setEditingTopic({
      id: topic.id,
      name: topic.name,
      parts: topic.topicParts.length > 0 ? topic.topicParts.map(p => p.name) : [''],
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Add New Topic</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="e.g., Mathematics"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Parts (Optional)</label>
            <div className="space-y-2">
              {newTopicParts.map((part, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={part}
                    onChange={(e) => handleCreatePartChange(idx, e.target.value)}
                    placeholder="e.g., Algebra"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {idx === newTopicParts.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setNewTopicParts([...newTopicParts, ''])}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                    >
                      +
                    </button>
                  )}
                  {newTopicParts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setNewTopicParts(newTopicParts.filter((_, i) => i !== idx))}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Add Topic
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topic & Parts
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : topics.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                  No topics found. Add one above.
                </td>
              </tr>
            ) : (
              topics.map((topic) => (
                <tr key={topic.id}>
                  <td className="px-6 py-4">
                    {editingTopic?.id === topic.id ? (
                      <form id={`edit-form-${topic.id}`} onSubmit={handleUpdate} className="space-y-3">
                        <input
                          type="text"
                          value={editingTopic.name}
                          onChange={(e) => setEditingTopic({ ...editingTopic, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                          {editingTopic.parts.map((part, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={part}
                                onChange={(e) => handleEditPartChange(idx, e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              {idx === editingTopic.parts.length - 1 && (
                                <button type="button" onClick={() => setEditingTopic({ ...editingTopic, parts: [...editingTopic.parts, ''] })} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">+</button>
                              )}
                              {editingTopic.parts.length > 1 && (
                                <button type="button" onClick={() => setEditingTopic({ ...editingTopic, parts: editingTopic.parts.filter((_, i) => i !== idx) })} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs">&times;</button>
                              )}
                            </div>
                          ))}
                          {editingTopic.parts.length === 0 && (
                            <button type="button" onClick={() => setEditingTopic({ ...editingTopic, parts: [''] })} className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-2 py-1 rounded bg-indigo-50">Add Part</button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">{topic.name}</div>
                        {topic.topicParts.length > 0 && (
                          <ul className="mt-1 pl-4 border-l-2 border-gray-200 space-y-1">
                            {topic.topicParts.map((part) => (
                              <li key={part.id} className="text-sm text-gray-600">{part.name}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                    {editingTopic?.id === topic.id ? (
                      <div className="flex justify-end gap-3 flex-col items-end">
                        <button type="submit" form={`edit-form-${topic.id}`} className="text-green-600 hover:text-green-900">Save</button>
                        <button type="button" onClick={() => setEditingTopic(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => startEdit(topic)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="text-red-600 hover:text-red-900"
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
