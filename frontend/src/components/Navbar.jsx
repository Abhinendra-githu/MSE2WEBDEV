import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, GraduationCap, ShieldCheck, LayoutDashboard, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={user?.role === 'admin' ? '/admin' : '/'} className="navbar-logo">
          <GraduationCap className="logo-icon" />
          <span>SGMS</span>
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link 
                  to="/admin" 
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={16} />
                  <span>Management Portal</span>
                </Link>
              ) : (
                <Link 
                  to="/" 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                  <FileText size={16} />
                  <span>My Grievances</span>
                </Link>
              )}

              <div className="user-profile-pill">
                <span className="navbar-user">{user.name}</span>
                <span className={`role-badge ${user.role === 'admin' ? 'role-officer' : 'role-student'}`}>
                  {user.role === 'admin' ? (
                    <>
                      <ShieldCheck size={13} /> Officer
                    </>
                  ) : (
                    'Student'
                  )}
                </span>
              </div>

              <button onClick={handleLogout} className="btn-logout" title="Sign out">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
