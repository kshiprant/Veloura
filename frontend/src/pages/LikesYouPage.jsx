import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function LikesYouPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [likedUsers, setLikedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPremium = user?.plan === 'premium' || user?.plan === 'pro';

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    const loadLikes = async () => {
      try {
        const { data } = await api.get('/users/likes-received');
        setLikedUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load likes:', error);
        setLikedUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadLikes();
  }, [isPremium]);

  return (
    <AppShell>
      <div className="page-wrap">
        <h2 className="page-title">Likes You</h2>
        <p className="muted small-text">
          People who already liked your profile
        </p>

        {!isPremium ? (
          <div className="likes-locked">
            <div className="likes-grid blurred">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="like-card">
                  <img src="https://placehold.co/300x400" alt="" />
                </div>
              ))}
            </div>

            <div className="likes-overlay">
              <h3>See who liked you</h3>
              <p className="muted">
                Upgrade to Premium to unlock this feature
              </p>

              <button
                className="button primary"
                onClick={() => navigate('/premium')}
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="soft-card">Loading likes...</div>
            ) : likedUsers.length === 0 ? (
              <div className="soft-card">
                No one has liked you yet.
              </div>
            ) : (
              <div className="likes-grid">
                {likedUsers.map((u) => (
                  <div key={u._id} className="like-card">
                    <img
                      src={u.photos?.[0] || 'https://placehold.co/300x400'}
                      alt={u.firstName}
                    />
                    <div className="like-name">
                      {u.firstName}, {u.age}
                    </div>
                    <div className="muted small-text">
                      {u.city}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
