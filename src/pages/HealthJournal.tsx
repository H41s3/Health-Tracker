import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotesStore } from '../stores/useNotesStore';
import { BookOpen, Plus, Edit2, Trash2, Search, Tag, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { HealthNote } from '../types/database';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';

export default function HealthJournal() {
  const { user } = useAuth();
  const { notes, fetchNotes, addNote, updateNote, deleteNote } = useNotesStore();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    content: '',
    tags: [] as string[],
    newTag: '',
  });

  useEffect(() => {
    if (user) {
      fetchNotes(user.id);
    }
  }, [user, fetchNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const noteData = {
      date: formData.date,
      title: formData.title,
      content: formData.content,
      tags: formData.tags,
    };

    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await addNote(user.id, noteData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      title: '',
      content: '',
      tags: [],
      newTag: '',
    });
    setEditingNote(null);
    setShowForm(false);
  };

  const handleEdit = (note: HealthNote) => {
    setEditingNote(note);
    setFormData({
      date: note.date,
      title: note.title,
      content: note.content || '',
      tags: note.tags || [],
      newTag: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
    }
  };

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag.trim()],
        newTag: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = !filterTag || (note.tags && note.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  return (
    <PageWrapper theme="insights">
      <div className="page-container space-section">
        {/* Hero Header */}
        <PageHeader
          title="Health Insights"
          subtitle="Document your health journey with notes and reflections"
          theme="insights"
          icon={<Lightbulb className="w-12 h-12 text-violet-500" />}
        />

      {/* Search and Filter Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary inline-flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'New Journal Entry'}
        </motion.button>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="input-field pl-12"
          />
        </div>

        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="input-field min-w-[150px]"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        )}
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              {editingNote ? 'Edit Note' : 'New Journal Entry'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Give your entry a title..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Write your thoughts, observations, or health notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Tags</label>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={formData.newTag}
                    onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 input-field"
                    placeholder="Add a tag..."
                  />
                  <motion.button
                    type="button"
                    onClick={addTag}
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add
                  </motion.button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full text-sm font-medium"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-emerald-900 transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="submit"
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingNote ? 'Update' : 'Save'} Note
                </motion.button>
                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        {filteredNotes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery || filterTag ? 'No Notes Found' : 'No Journal Entries Yet'}
            </h3>
            <p className="text-slate-500">
              {searchQuery || filterTag
                ? 'Try adjusting your search or filter criteria'
                : 'Start documenting your health journey with your first entry!'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card p-6 group hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-slate-900">{note.title}</h3>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {format(new Date(note.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-full text-xs font-medium"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      onClick={() => handleEdit(note)}
                      className="p-2 text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                {note.content && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      </div>
    </PageWrapper>
  );
}
