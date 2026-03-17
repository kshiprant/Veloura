import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const FREE_DAILY_LIKE_LIMIT = 15;

export default function DiscoverPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [likeLimitReached, setLikeLimitReached] = useState(false);
  const [likesRemaining, setLikesRemaining] = useState(
    user?.plan === 'free' || !user?.plan ? FREE_DAILY_LIKE_LIMIT : null
  );

  const isPremium = user?.plan === 'premium';
  const isPro = user?.plan === 'pro';
  const isFree = !isPremium && !isPro;

  const planLabel = useMemo(() => {
    if (isPro) return 'Premium Pro';
    if (isPremium) return 'Premium';
    return 'Free';
  }, [isPremium, isPro]);

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

  useEffect(() => {
    if (!isFree) {
      setLikesRemaining(null);
      setLikeLimitReached(false);
      return;
    }

    if (typeof likesRemaining === 'number' && likesRemaining <= 0) {
      setLikeLimitReached(true);
    }
  }, [isFree, likesRemaining]);

  const like = async (id) => {
    try {
      setLikeLimitReached(false);

      const { data } = await api.post(`/users/like/${id}`);

      setNotice(data.message || (data.matched ? "It's a match!" : 'Like sent'));
      setProfiles((prev) => prev.filter((p) => p._id !== id));

      if (isFree && typeof data?.likesRemaining === 'number') {
        setLikesRemaining(data.likesRemaining);
        if (data.likesRemaining <= 0) {
          setLikeLimitReached(true);
        }
      }

      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('Like failed:', err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Could not send like';
      const remaining = err?.response?.data?.likesRemaining;

      setNotice(message);

      if (typeof remaining === 'number') {
        setLikesRemaining(remaining);
      }

      if (status === 403 || status === 429) {
        setLikeLimitReached(true);
      }

      setTimeout(() => setNotice(''), 2500);
    }
  };

  const current = profiles[0];

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="row between center">
          <div>
            <h2>Discover</h2>
            <div className="muted small-text">Your plan: {planLabel}</div>
          </div>
          {notice ? <div className="success-pill">{notice}</div> : null}
        </div>

        {isFree ? (
          <div className="soft-card discover-plan-banner">
            <div className="discover-plan-copy">
              <div className="strong">Free plan</div>
              <div className="muted small-text">
                Daily likes are limited. Upgrade to Premium for unlimited likes and to see who liked you.
              </div>
              <div className="discover-likes-count">
                Likes left today:{' '}
                <span className="strong">
                  {typeof likesRemaining === 'number' ? likesRemaining : FREE_DAILY_LIKE_LIMIT}
                </span>
              </div>
            </div>

            <button
              className="button outline small"
              onClick={() => navigate('/premium')}
            >
              Upgrade
            </button>
          </div>
        ) : null}

        {likeLimitReached && isFree ? (
          <div className="soft-card discover-lock-card">
            <h3>Daily like limit reached</h3>
            <p className="muted">
              Upgrade to Premium to continue liking without limits and unlock Likes You.
            </p>

            <div className="footer-actions no-top">
              <button
                className="button outline half"
                onClick={() => navigate('/premium')}
              >
                Get Premium
              </button>

              <button
                className="button primary half"
                onClick={() => navigate('/premium-pro')}
              >
                Get Pro
              </button>
            </div>
          </div>
        ) : null}

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
              <h1>
                {current.firstName}, {current.age}
              </h1>

              <div className="muted">
                {current.city} • {current.intention}
              </div>

              <p>{current.bio || 'No bio yet.'}</p>

              <div className="chip-grid">
                {(current.interests || []).map((item) => (
                  <span key={item} className="chip-tag">
                    {item}
                  </span>
                ))}
              </div>

              <div className="stack gap12 top16">
                {(current.prompts || [])
                  .filter((p) => p.answer)
                  .map((p) => (
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
                disabled={likeLimitReached && isFree}
              >
                {likeLimitReached && isFree ? 'Limit Reached' : 'Like'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
