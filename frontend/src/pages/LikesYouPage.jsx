import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

export default function LikesYouPage() {
  const { user } = useAuth();

  const isPremium = user?.plan === 'premium' || user?.plan === 'pro';

  // mock data for now (replace later with API)
  const likedUsers = [
    { id: 1, name: 'Aanya', image: 'https://placehold.co/300x400' },
    { id: 2, name: 'Riya', image: 'https://placehold.co/300x400' },
    { id: 3, name: 'Simran', image: 'https://placehold.co/300x400' },
    { id: 4, name: 'Megha', image: 'https://placehold.co/300x400' },
  ];

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
              {likedUsers.map((user) => (
                <div key={user.id} className="like-card">
                  <img src={user.image} alt="" />
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
                onClick={() => (window.location.href = '/premium')}
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        ) : (
          <div className="likes-grid">
            {likedUsers.map((user) => (
              <div key={user.id} className="like-card">
                <img src={user.image} alt="" />
                <div className="like-name">{user.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
