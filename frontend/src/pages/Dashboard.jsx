import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Search, Plus, Trash2, Edit2, X, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';

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

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/grievances');
      setGrievances(res.data);
    } catch (err) {
      console.error('Error fetching grievances:', err);
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
      const res = await api.get(`/grievances/search?title=${encodeURIComponent(searchQuery)}`);
      setGrievances(res.data);
    } catch (err) {
      console.error('Error searching grievances:', err);
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
      console.error('Error submitting grievance:', err);
      alert(err.response?.data?.message || 'Failed to save grievance');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await api.delete(`/grievances/${id}`);
        fetchGrievances();
      } catch (err) {
        console.error('Error deleting grievance:', err);
      }
    }
  };

  const handleEdit = (grievance) => {
    if (grievance.status === 'Resolved' || grievance.status === 'Rejected') {
      alert(`Cannot edit a grievance that is already marked as ${grievance.status}.`);
      return;
    }
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge badge-pending';
      case 'In Progress': return 'badge badge-inprogress';
      case 'Resolved': return 'badge badge-resolved';
      case 'Rejected': return 'badge badge-rejected';
      default: return 'badge';
    }
  };

  return (
    <div className="dashboard-container">
      {user?.role === 'admin' && (
        <div className="admin-banner">
          <div className="admin-banner-text">
            <ShieldCheck size={20} />
            <span>You are logged in as a <strong>Grievance Officer / Admin</strong>.</span>
          </div>
          <Link to="/admin" className="btn-primary btn-sm">
            Go to Management Portal &rarr;
          </Link>
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h1>My Grievances</h1>
          <p className="subtitle">Track your submitted grievances and resolution status</p>
        </div>
        <button className="btn-primary flex items-center" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Submit New Grievance
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
                  placeholder="Brief summary of the issue..."
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
                  placeholder="Provide detailed information regarding the problem..."
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
          <CheckCircle2 size={48} className="empty-icon" />
          <h3>No grievances submitted yet</h3>
          <p>If you are facing any issues with academic, hostel, or transport services, click "Submit New Grievance" above.</p>
        </div>
      ) : (
        <div className="grievances-grid">
          {grievances.map((g) => (
            <div key={g._id} className="grievance-card">
              <div className="card-header">
                <h3>{g.title}</h3>
                <span className={getStatusBadgeClass(g.status)}>{g.status}</span>
              </div>
              <p className="card-category">Category: <strong>{g.category}</strong></p>
              <p className="card-desc">{g.description}</p>

              {g.adminRemark && (
                <div className="official-remark-box">
                  <div className="remark-header">
                    <MessageSquare size={14} />
                    <span>Officer Response:</span>
                  </div>
                  <p className="remark-text">{g.adminRemark}</p>
                </div>
              )}

              <div className="card-footer">
                <span className="card-date">{new Date(g.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <div className="card-actions">
                  {g.status !== 'Resolved' && g.status !== 'Rejected' && (
                    <button 
                      onClick={() => handleEdit(g)} 
                      className="btn-icon text-blue"
                      title="Edit Grievance"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(g._id)} 
                    className="btn-icon text-red"
                    title="Delete Grievance"
                  >
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
