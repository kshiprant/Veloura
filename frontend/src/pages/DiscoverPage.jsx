import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../api/client';

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/users/discovery');
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Discovery load failed:', err);
      setError(err?.response?.data?.message || 'Could not load profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const like = async (id) => {
    try {
      const { data } = await api.post(`/users/like/${id}`);
      setNotice(data.message || (data.matched ? "It's a match!" : 'Like sent'));
      setProfiles((prev) => prev.filter((p) => p._id !== id));
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('Like failed:', err);
      setNotice(err?.response?.data?.message || 'Could not send like');
      setTimeout(() => setNotice(''), 2500);
    }
  };

  const current = profiles[0];

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="row between center">
          <h2>Discover</h2>
          {notice ? <div className="success-pill">{notice}</div> : null}
        </div>

        {loading ? <div className="soft-card">Loading profiles...</div> : null}

        {!loading && error ? (
          <div className="soft-card">{error}</div>
        ) : null}

        {!loading && !error && !current ? (
          <div className="soft-card">No more profiles for now. Come back later.</div>
        ) : null}

        {current ? (
          <div className="profile-card soft-card">
            <img
              src={current.photos?.[0] || 'https://placehold.co/800x1000?text=Veloura'}
              alt={current.firstName}
              className="hero-image"
            />
            <div className="profile-body">
              <h1>{current.firstName}, {current.age}</h1>
              <div className="muted">{current.city} • {current.intention}</div>
              <p>{current.bio || 'No bio yet.'}</p>

              <div className="chip-grid">
                {(current.interests || []).map((item) => (
                  <span key={item} className="chip-tag">{item}</span>
                ))}
              </div>

              <div className="stack gap12 top16">
                {(current.prompts || []).filter((p) => p.answer).map((p) => (
                  <div key={p.question} className="prompt-card small">
                    <div className="prompt-title">{p.question}</div>
                    <p>{p.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="footer-actions no-top">
              <button
                className="button outline half"
                onClick={() => setProfiles((prev) => prev.slice(1))}
              >
                Pass
              </button>
              <button
                className="button primary half"
                onClick={() => like(current._id)}
              >
                Like
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
