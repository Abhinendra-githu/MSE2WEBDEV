import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Search, Plus, Trash2, Edit2, X } from 'lucide-react';

const Dashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic'
  });
  const [editingId, setEditingId] = useState(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${user.token}` }
  });

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/grievances');
      setGrievances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
    // eslint-disable-next-line
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchGrievances();
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/grievances/search?title=${searchQuery}`);
      setGrievances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/grievances/${editingId}`, formData);
      } else {
        await api.post('/grievances', formData);
      }
      resetForm();
      fetchGrievances();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await api.delete(`/grievances/${id}`);
        fetchGrievances();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (grievance) => {
    setFormData({
      title: grievance.title,
      description: grievance.description,
      category: grievance.category
    });
    setEditingId(grievance._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'Academic' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Grievances</h1>
        <button className="btn-primary flex items-center" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Grievance
        </button>
      </div>

      <div className="search-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search grievances by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">
            <Search size={18} />
          </button>
        </form>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Grievance' : 'Submit New Grievance'}</h2>
              <button className="btn-close" onClick={resetForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grievance-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">
                {editingId ? 'Update Grievance' : 'Submit Grievance'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="loader"></div></div>
      ) : grievances.length === 0 ? (
        <div className="empty-state">
          <p>No grievances found.</p>
        </div>
      ) : (
        <div className="grievances-grid">
          {grievances.map((g) => (
            <div key={g._id} className="grievance-card">
              <div className="card-header">
                <h3>{g.title}</h3>
                <span className={`badge badge-${g.status.toLowerCase()}`}>{g.status}</span>
              </div>
              <p className="card-category">Category: {g.category}</p>
              <p className="card-desc">{g.description}</p>
              <div className="card-footer">
                <span className="card-date">{new Date(g.date).toLocaleDateString()}</span>
                <div className="card-actions">
                  <button onClick={() => handleEdit(g)} className="btn-icon text-blue">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(g._id)} className="btn-icon text-red">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
