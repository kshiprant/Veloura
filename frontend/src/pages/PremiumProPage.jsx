import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

export default function PremiumProPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPro = user?.plan === 'pro';

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card premium-page-hero premium-pro-hero">
          <div className="pill premium-pro-pill">Veloura Premium Pro</div>

          <h1 className="top16">
            Maximum reach.
            <br />
            Stronger profile advantage.
          </h1>

          <p className="muted top16">
            Premium Pro is built for users who want the highest visibility, more exposure,
            and stronger discovery performance.
          </p>

          <div className="premium-price-block top24">
            <div className="premium-price-card">
              <div className="premium-price-label">Monthly</div>
              <div className="premium-price">₹599</div>
              <div className="muted small-text">Billed every month</div>
            </div>

            <div className="premium-price-card premium-price-card-highlight premium-pro-price-card">
              <div className="premium-price-label">Yearly</div>
              <div className="premium-price">₹3999</div>
              <div className="muted small-text">Best Pro value</div>
            </div>
          </div>

          {isPro ? (
            <button className="button outline top24" onClick={() => navigate('/profile')}>
              You already have Premium Pro
            </button>
          ) : (
            <button
              className="button primary top24"
              onClick={() => navigate('/checkout/premium-pro')}
            >
              Continue to Pro Payment
            </button>
          )}
        </div>

        <div className="soft-card">
          <h3>Everything in Premium, plus</h3>

          <div className="premium-feature-list top24">
            <div className="premium-feature-item">
              <div className="premium-feature-icon">🚀</div>
              <div>
                <div className="strong">Priority profile placement</div>
                <div className="muted small-text">
                  Show up ahead of free users and get stronger discover placement.
                </div>
              </div>
            </div>

            <div className="premium-feature-item">
              <div className="premium-feature-icon">⭐</div>
              <div>
                <div className="strong">Elite badge</div>
                <div className="muted small-text">
                  Stand out visually with a higher-tier profile identity.
                </div>
              </div>
            </div>

            <div className="premium-feature-item">
              <div className="premium-feature-icon">📈</div>
              <div>
                <div className="strong">Stronger reach boost</div>
                <div className="muted small-text">
                  Get more profile exposure than Premium users.
                </div>
              </div>
            </div>

            <div className="premium-feature-item">
              <div className="premium-feature-icon">🎯</div>
              <div>
                <div className="strong">Advanced discover advantage</div>
                <div className="muted small-text">
                  Better positioning for relevant and high-intent matches.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="soft-card">
          <h3>Premium vs Pro</h3>

          <div className="plan-compare top24">
            <div className="plan-compare-row">
              <span>Unlimited likes</span>
              <span>Premium + Pro</span>
            </div>

            <div className="plan-compare-row">
              <span>See who liked you</span>
              <span>Premium + Pro</span>
            </div>

            <div className="plan-compare-row">
              <span>Better visibility</span>
              <span>Premium</span>
            </div>

            <div className="plan-compare-row">
              <span>Priority placement</span>
              <span>Pro only</span>
            </div>

            <div className="plan-compare-row">
              <span>Elite badge</span>
              <span>Pro only</span>
            </div>

            <div className="plan-compare-row">
              <span>Strongest reach</span>
              <span>Pro only</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
