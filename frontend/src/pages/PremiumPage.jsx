import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

export default function PremiumPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPremium = user?.plan === 'premium';
  const isPro = user?.plan === 'pro';

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card premium-page-hero">
          <div className="pill">Veloura Premium</div>

          <h1 className="top16">
            Unlimited likes.
            <br />
            See who liked you.
          </h1>

          <p className="muted top16">
            Premium removes the biggest limits and gives you better control over discovery.
          </p>

          <div className="premium-price-block top24">
            <div className="premium-price-card">
              <div className="premium-price-label">Monthly</div>
              <div className="premium-price">₹299</div>
              <div className="muted small-text">Billed every month</div>
            </div>

            <div className="premium-price-card premium-price-card-highlight">
              <div className="premium-price-label">Yearly</div>
              <div className="premium-price">₹1999</div>
              <div className="muted small-text">Best value</div>
            </div>
          </div>

          {isPremium || isPro ? (
            <button className="button outline top24" onClick={() => navigate('/profile')}>
              {isPro ? 'You already have Premium Pro' : 'You already have Premium'}
            </button>
          ) : (
            <button className="button primary top24">
              Continue to Payment
            </button>
          )}
        </div>

        <div className="soft-card">
          <h3>What Premium unlocks</h3>

          <div className="premium-feature-list top24">
            <div className="premium-feature-item">
              <div className="premium-feature-icon">∞</div>
              <div>
                <div className="strong">Unlimited likes</div>
                <div className="muted small-text">
                  No daily like cap. Keep discovering without waiting for reset.
                </div>
              </div>
            </div>

            <div className="premium-feature-item">
              <div className="premium-feature-icon">❤</div>
              <div>
                <div className="strong">See who liked you</div>
                <div className="muted small-text">
                  Unlock the Likes You page and view incoming interest directly.
                </div>
              </div>
            </div>

            <div className="premium-feature-item">
              <div className="premium-feature-icon">⌕</div>
              <div>
                <div className="strong">Advanced filters</div>
                <div className="muted small-text">
                  Discover more relevant people with better filtering options.
                </div>
              </div>
            </div>

            <div className="premium-feature-item">
              <div className="premium-feature-icon">↑</div>
              <div>
                <div className="strong">Better profile visibility</div>
                <div className="muted small-text">
                  Improve reach in discover compared to free users.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="soft-card">
          <div className="row between center gap12 premium-compare-head">
            <div>
              <h3>Want even more reach?</h3>
              <div className="muted small-text">
                Premium Pro gives you stronger visibility and advanced advantages.
              </div>
            </div>

            <button
              className="button outline small"
              onClick={() => navigate('/premium-pro')}
            >
              View Pro
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
