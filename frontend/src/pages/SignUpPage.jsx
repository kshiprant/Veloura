import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register(form);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card soft-card">
        <Logo />
        <h2>Create account</h2>
        <p className="muted">Start your journey to meaningful connection</p>
        <form className="stack gap16" onSubmit={submit}>
          <label>Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" />
          {error ? <div className="error-text">{error}</div> : null}
          <button className="button primary" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="subtle-center top24">Already have an account? <Link to="/signin">Sign in</Link></p>
      </div>
    </div>
  );
}
