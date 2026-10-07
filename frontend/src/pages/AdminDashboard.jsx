import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Trash2, 
  Edit3, 
  X, 
  Filter, 
  User, 
  Mail, 
  Calendar,
  MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Status update modal state
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [resolutionData, setResolutionData] = useState({
    status: 'In Progress',
    adminRemark: ''
  });
  const [updating, setUpdating] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/grievances/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      let url = '/grievances?';
      if (categoryFilter !== 'All') url += `category=${categoryFilter}&`;
      if (statusFilter !== 'All') url += `status=${statusFilter}&`;
      
      const res = await api.get(url);
      setGrievances(res.data);
    } catch (err) {
      console.error('Error fetching grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchGrievances();
    // eslint-disable-next-line
  }, [categoryFilter, statusFilter]);

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
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const openResolutionModal = (grievance) => {
    setSelectedGrievance(grievance);
    setResolutionData({
      status: grievance.status,
      adminRemark: grievance.adminRemark || ''
    });
  };

  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrievance) return;
    try {
      setUpdating(true);
      await api.put(`/grievances/${selectedGrievance._id}/status`, resolutionData);
      setSelectedGrievance(null);
      fetchStats();
      fetchGrievances();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update grievance status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await api.delete(`/grievances/${id}`);
        fetchStats();
        fetchGrievances();
      } catch (err) {
        console.error('Error deleting grievance:', err);
      }
    }
  };

  const categories = ['All', 'Academic', 'Hostel', 'Transport', 'Other'];
  const statuses = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

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
    <div className="admin-container">
      {/* Officer Header */}
      <div className="admin-header">
        <div className="admin-title-group">
          <div className="admin-badge-role">
            <ShieldCheck size={20} />
            <span>Resolution Authority Portal</span>
          </div>
          <h1>Grievance Management Center</h1>
          <p>Review student concerns, assign progress updates, and resolve grievances.</p>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon-wrapper">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Submissions</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Action</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>

        <div className="stat-card stat-inprogress">
          <div className="stat-icon-wrapper">
            <Edit3 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats.inProgress}</span>
          </div>
        </div>

        <div className="stat-card stat-resolved">
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Resolved Cases</span>
            <span className="stat-value">{stats.resolved}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="control-bar">
        <form onSubmit={handleSearch} className="admin-search-form">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">Search</button>
        </form>

        <div className="filter-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grievance Grid */}
      {loading ? (
        <div className="loading-container"><div className="loader"></div></div>
      ) : grievances.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={48} className="empty-icon" />
          <h3>No grievances found</h3>
          <p>No student submissions match your current search or filter criteria.</p>
        </div>
      ) : (
        <div className="admin-grievances-grid">
          {grievances.map((g) => (
            <div key={g._id} className="admin-card">
              <div className="admin-card-top">
                <div className="student-badge">
                  <User size={14} />
                  <span>{g.user?.name || 'Anonymous Student'}</span>
                  {g.user?.email && (
                    <span className="student-email">
                      <Mail size={12} /> {g.user.email}
                    </span>
                  )}
                </div>
                <span className={getStatusBadgeClass(g.status)}>{g.status}</span>
              </div>

              <div className="admin-card-body">
                <span className="category-pill">{g.category}</span>
                <h3 className="grievance-title">{g.title}</h3>
                <p className="grievance-description">{g.description}</p>

                {g.adminRemark && (
                  <div className="official-remark-box">
                    <div className="remark-header">
                      <MessageSquare size={14} />
                      <span>Official Resolution Remark:</span>
                    </div>
                    <p className="remark-text">{g.adminRemark}</p>
                  </div>
                )}
              </div>

              <div className="admin-card-footer">
                <div className="footer-date">
                  <Calendar size={14} />
                  <span>{new Date(g.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                
                <div className="admin-card-actions">
                  <button 
                    onClick={() => openResolutionModal(g)}
                    className="btn-action btn-resolve"
                  >
                    <Edit3 size={15} />
                    <span>Manage / Resolve</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(g._id)} 
                    className="btn-icon text-red"
                    title="Delete Grievance"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedGrievance && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal">
            <div className="modal-header">
              <div>
                <h2>Manage Grievance Status</h2>
                <p className="modal-subtitle">Update resolution progress & send official response to student</p>
              </div>
              <button className="btn-close" onClick={() => setSelectedGrievance(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-grievance-summary">
              <h4>{selectedGrievance.title}</h4>
              <p className="summary-student">Submitted by: <strong>{selectedGrievance.user?.name}</strong> ({selectedGrievance.user?.email})</p>
              <p className="summary-desc">{selectedGrievance.description}</p>
            </div>

            <form onSubmit={handleResolutionSubmit} className="grievance-form">
              <div className="form-group">
                <label>Resolution Status</label>
                <div className="status-radio-group">
                  {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => (
                    <label 
                      key={s} 
                      className={`status-radio-label ${resolutionData.status === s ? 'active ' + s.toLowerCase().replace(' ', '-') : ''}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={resolutionData.status === s}
                        onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value })}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Official Resolution Notes / Feedback to Student</label>
                <textarea
                  rows="4"
                  required={resolutionData.status === 'Resolved' || resolutionData.status === 'Rejected'}
                  placeholder="e.g. Investigation completed. Maintenance team dispatched to hostel block B..."
                  value={resolutionData.adminRemark}
                  onChange={(e) => setResolutionData({ ...resolutionData, adminRemark: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setSelectedGrievance(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={updating}
                >
                  {updating ? 'Saving Update...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
