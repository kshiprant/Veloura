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
        if (data.likesRemaining <= 0) setLikeLimitReached(true);
      }

      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('Like failed:', err);

      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Could not send like';
      const remaining = err?.response?.data?.likesRemaining;

      setNotice(message);

      if (typeof remaining === 'number') setLikesRemaining(remaining);
      if (status === 403 || status === 429) setLikeLimitReached(true);

      setTimeout(() => setNotice(''), 2500);
    }
  };

  const current = profiles[0];

  return (
    <AppShell>
      <div className="stack gap16">
        {/* Header */}
        <div className="row between center">
          <div>
            <h2>Discover</h2>
            <div className="muted small-text">Your plan: {planLabel}</div>
          </div>
          {notice ? <div className="success-pill">{notice}</div> : null}
        </div>

        {/* Clean Upgrade Card */}
        {isFree ? (
          <div className="discover-upgrade-card">
            <div>
              <div className="discover-upgrade-title">Free plan</div>
              <div className="discover-upgrade-sub">
                {typeof likesRemaining === 'number'
                  ? `${likesRemaining} likes left today`
                  : 'Limited likes today'}
              </div>
            </div>

            <button
              className="discover-upgrade-btn"
              onClick={() => navigate('/premium')}
            >
              Upgrade
            </button>
          </div>
        ) : null}

        {/* Lock Card */}
        {likeLimitReached && isFree ? (
          <div className="soft-card discover-lock-card">
            <h3>Daily like limit reached</h3>
            <p className="muted">
              Upgrade to continue liking without limits
            </p>

            <div className="footer-actions no-top">
              <button
                className="button outline half"
                onClick={() => navigate('/premium')}
              >
                Premium
              </button>

              <button
                className="button primary half"
                onClick={() => navigate('/premium-pro')}
              >
                Pro
              </button>
            </div>
          </div>
        ) : null}

        {/* States */}
        {loading ? <div className="soft-card">Loading profiles...</div> : null}

        {!loading && error ? (
          <div className="soft-card">{error}</div>
        ) : null}

        {!loading && !error && !current ? (
          <div className="soft-card">No more profiles for now.</div>
        ) : null}

        {/* Profile */}
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
                {current.city}
                {typeof current.distanceKm === 'number'
                  ? ` • ${current.distanceKm} km`
                  : ''}
                {current.intention ? ` • ${current.intention}` : ''}
              </div>

              <p>{current.bio || 'No bio yet.'}</p>

              <div className="chip-grid">
                {(current.interests || []).map((item) => (
                  <span key={item} className="chip-tag">
                    {item}
                  </span>
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
