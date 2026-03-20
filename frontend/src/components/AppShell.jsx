import { Link, useLocation } from 'react-router-dom';
import InstallPrompt from '../components/InstallPrompt';

export default function AppShell({ children }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <main className="page-wrap">{children}</main>

      {/* Install Prompt */}
      <InstallPrompt />

      <nav className="bottom-nav">
        <Link
          to="/discover"
          className={`nav-item ${location.pathname === '/discover' ? 'active' : ''}`}
        >
          <span className="nav-icon">○</span>
          <span className="nav-label">Discover</span>
        </Link>

        <Link
          to="/spark"
          className={`nav-item ${location.pathname === '/spark' ? 'active' : ''}`}
        >
          <span className="nav-icon">⚡</span>
          <span className="nav-label">Spark</span>
        </Link>

        <Link
          to="/matches"
          className={`nav-item ${location.pathname === '/matches' ? 'active' : ''}`}
        >
          <span className="nav-icon">◎</span>
          <span className="nav-label">Matches</span>
        </Link>

        <Link
          to="/profile"
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          <span className="nav-icon">◉</span>
          <span className="nav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
