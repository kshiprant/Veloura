import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="auth-page landing-page">
      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <Link to="/signin" className="ghost-link">Sign In</Link>
          <Link to="/signup" className="button small primary">Get Started</Link>
        </div>
      </header>
      <section className="hero-card">
        <div className="pill">Where real connection begins</div>
        <h1>Dating with <span>depth</span>, not speed</h1>
        <p>
          Veloura is a premium dating experience designed for people who value substance over swipes.
          Slow down. Go deeper. Find your person.
        </p>
        <div className="stack gap16">
          <Link className="button primary" to="/signup">Start Your Journey</Link>
          <Link className="button outline" to="/signin">I Have an Account</Link>
        </div>
        <div className="subtle-center">Free to join • Premium features available</div>
      </section>
    </div>
  );
}
