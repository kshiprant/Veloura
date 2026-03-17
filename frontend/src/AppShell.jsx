import { Link, useLocation } from 'react-router-dom';

export default function AppShell({ children }) {
  const location = useLocation();
  return (
    <div className="app-shell">
      <main className="page-wrap">{children}</main>
      <nav className="bottom-nav">
        <Link className={location.pathname === '/discover' ? 'active' : ''} to="/discover">Discover</Link>
        <Link className={location.pathname === '/matches' ? 'active' : ''} to="/matches">Matches</Link>
        <Link className={location.pathname === '/profile' ? 'active' : ''} to="/profile">Profile</Link>
      </nav>
    </div>
  );
}
