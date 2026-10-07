import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogIn, Mail, Lock, ShieldCheck, GraduationCap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'admin') {
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
          : err.message || 'Failed to login');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <LogIn size={26} />
          </div>
          <h2>Welcome Back</h2>
          <p>Login to access your grievance portal</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}

        <div className="auth-roles-hint">
          <div className="role-hint-pill">
            <GraduationCap size={14} />
            <span>Students</span>
          </div>
          <span className="hint-divider">&bull;</span>
          <div className="role-hint-pill">
            <ShieldCheck size={14} />
            <span>Grievance Resolvers</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
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
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full btn-auth-submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="mini-spinner"></span> Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create an account &rarr;</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
