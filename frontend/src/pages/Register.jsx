import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus, GraduationCap, ShieldCheck, CheckCircle2, User, Mail, Lock, Sparkles } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newUser = await register(name, email, password, role);
      if (newUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Request timed out. The backend server might be waking up (Render free tier spin-up can take ~50s). Please try again in a moment.'
          : err.message === 'Network Error'
          ? 'Network Error: Cannot reach backend server. Please verify VITE_API_URL or check if backend is online.'
          : err.message || 'Failed to register');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={26} />
          </div>
          <h2>Create Account</h2>
          <p>Join the student grievance management & resolution platform</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}

        {/* Visual Role Selector Grid */}
        <div className="role-selection-wrapper">
          <label className="role-selection-label">Select Account Type</label>
          <div className="role-grid">
            <div
              className={`role-card-option ${role === 'student' ? 'selected' : ''}`}
              onClick={() => setRole('student')}
              role="button"
              tabIndex={0}
            >
              <div className="role-card-icon-wrap student-icon">
                <GraduationCap size={22} />
              </div>
              <div className="role-card-info">
                <span className="role-card-title">Student</span>
                <span className="role-card-desc">Lodge & track issues</span>
              </div>
              {role === 'student' && (
                <div className="role-card-check">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>

            <div
              className={`role-card-option ${role === 'admin' ? 'selected' : ''}`}
              onClick={() => setRole('admin')}
              role="button"
              tabIndex={0}
            >
              <div className="role-card-icon-wrap officer-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="role-card-info">
                <span className="role-card-title">Grievance Resolver</span>
                <span className="role-card-desc">Review & resolve cases</span>
              </div>
              {role === 'admin' && (
                <div className="role-card-check">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={role === 'admin' ? 'e.g. Dr. Arthur Miller (Officer)' : 'e.g. Alex Johnson'}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Official Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={role === 'admin' ? 'resolver@institution.edu' : 'student@institution.edu'}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a secure password"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="mini-spinner"></span> Registering...
              </span>
            ) : (
              <>
                <Sparkles size={17} />
                <span>Register as {role === 'admin' ? 'Grievance Resolver' : 'Student'}</span>
              </>
            )}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here &rarr;</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
