import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotesStore } from '../stores/useNotesStore';
import { useToastStore } from '../stores/useToastStore';
import { BookOpen, Plus, Edit2, Trash2, Search, Tag, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { HealthNote } from '../types/database';
import PageWrapper from '../components/Layout/PageWrapper';
import PageHeader from '../components/Layout/PageHeader';

const inputStyle = {
  background: 'rgba(11, 41, 66, 0.8)',
  border: '1px solid rgba(127, 219, 202, 0.2)',
  color: '#d6deeb',
};

export default function HealthJournal() {
  const { user } = useAuth();
  const { notes, fetchNotes, addNote, updateNote, deleteNote } = useNotesStore();
  const { show } = useToastStore();
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
    
    if (!formData.title.trim()) {
      show('Please enter a title', 'error');
      return;
    }

    try {
      const noteData = {
        date: formData.date,
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
      };

      if (editingNote) {
        await updateNote(editingNote.id, noteData);
        show('Note updated successfully', 'success');
      } else {
        await addNote(user.id, noteData);
        show('Note added successfully', 'success');
      }

      resetForm();
    } catch {
      show('Failed to save note. Please try again.', 'error');
    }
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
      try {
        await deleteNote(id);
        show('Note deleted successfully', 'success');
      } catch {
        show('Failed to delete note. Please try again.', 'error');
      }
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
        <PageHeader
          title="Health Insights"
          subtitle="Document your health journey with notes and reflections"
          theme="insights"
          icon={<Lightbulb className="w-12 h-12" style={{ color: '#c792ea' }} />}
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
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
          style={{ 
            background: 'linear-gradient(135deg, #c792ea 0%, #82aaff 100%)',
            color: '#011627'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'New Journal Entry'}
        </motion.button>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#5f7e97' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#c792ea';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="min-w-[150px] px-4 py-3 rounded-xl outline-none transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#c792ea';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
            className="p-8 mb-8 rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <h2 className="text-2xl font-semibold mb-6" style={{ color: '#d6deeb' }}>
              {editingNote ? 'Edit Note' : 'New Journal Entry'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#c792ea';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="Give your entry a title..."
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#c792ea';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5f7e97' }}>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 resize-none"
                  style={inputStyle}
                  placeholder="Write your thoughts, observations, or health notes..."
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#c792ea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#5f7e97' }}>Tags</label>
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
                    className="flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="Add a tag..."
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#c792ea';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(199, 146, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(127, 219, 202, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <motion.button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 rounded-xl font-medium transition-all duration-200"
                    style={{ 
                      background: 'rgba(95, 126, 151, 0.2)',
                      border: '1px solid rgba(127, 219, 202, 0.2)',
                      color: '#d6deeb'
                    }}
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
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          background: 'rgba(127, 219, 202, 0.15)',
                          color: '#7fdbca'
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 transition-colors"
                          style={{ color: '#7fdbca' }}
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
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, #c792ea 0%, #82aaff 100%)',
                    color: '#011627'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingNote ? 'Update' : 'Save'} Note
                </motion.button>
                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    background: 'rgba(95, 126, 151, 0.2)',
                    border: '1px solid rgba(127, 219, 202, 0.2)',
                    color: '#d6deeb'
                  }}
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
            className="p-12 text-center rounded-xl"
            style={{
              background: 'rgba(29, 59, 83, 0.6)',
              border: '1px solid rgba(127, 219, 202, 0.1)'
            }}
          >
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(199, 146, 234, 0.15)' }}
            >
              <BookOpen className="w-8 h-8" style={{ color: '#c792ea' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#d6deeb' }}>
              {searchQuery || filterTag ? 'No Notes Found' : 'No Journal Entries Yet'}
            </h3>
            <p style={{ color: '#5f7e97' }}>
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
                className="p-6 group rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(29, 59, 83, 0.6)',
                  border: '1px solid rgba(127, 219, 202, 0.1)'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold" style={{ color: '#d6deeb' }}>{note.title}</h3>
                      <span 
                        className="text-sm px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(95, 126, 151, 0.2)', color: '#5f7e97' }}
                      >
                        {format(new Date(note.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              background: 'rgba(199, 146, 234, 0.15)',
                              color: '#c792ea'
                            }}
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
                      className="p-2 rounded-xl transition-all duration-200"
                      style={{ color: '#5f7e97' }}
                      whileHover={{ scale: 1.1, color: '#c792ea', backgroundColor: 'rgba(199, 146, 234, 0.1)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 rounded-xl transition-all duration-200"
                      style={{ color: '#5f7e97' }}
                      whileHover={{ scale: 1.1, color: '#ff5874', backgroundColor: 'rgba(255, 88, 116, 0.1)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                {note.content && (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#7fdbca' }}>
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
