import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const PLAN_META = {
  premium: {
    title: 'Veloura Premium',
    monthly: 299,
    yearly: 1999,
  },
  pro: {
    title: 'Veloura Premium Pro',
    monthly: 599,
    yearly: 3999,
  },
};

export default function CheckoutPage() {
  const { plan } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const planKey = plan === 'premium-pro' ? 'pro' : plan;
  const meta = PLAN_META[planKey];

  const amount = useMemo(() => {
    if (!meta) return 0;
    return billingCycle === 'yearly' ? meta.yearly : meta.monthly;
  }, [meta, billingCycle]);

  if (!meta) {
    return (
      <AppShell>
        <div className="soft-card">
          <h2>Invalid plan</h2>
          <p className="muted">This payment page does not exist.</p>
        </div>
      </AppShell>
    );
  }

  const handleMockPayment = async () => {
    setProcessing(true);

    try {
      const { data } = await api.post('/billing/checkout/mock-complete', {
        plan: planKey,
        billingCycle,
        paymentMethod,
        amount,
      });

      if (data?.user) {
        setUser(data.user);
      }

      navigate('/profile');
    } catch (error) {
      console.error('Payment failed:', error);
      alert(error?.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card">
          <div className="pill">Secure Checkout</div>
          <h1 className="top16">{meta.title}</h1>
          <p className="muted top16">
            Complete your upgrade and unlock paid features instantly.
          </p>
        </div>

        <div className="soft-card">
          <h3>Select billing</h3>

          <div className="checkout-option-grid top24">
            <button
              type="button"
              className={`checkout-option-card ${billingCycle === 'monthly' ? 'selected' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              <div className="checkout-option-title">Monthly</div>
              <div className="checkout-option-price">₹{meta.monthly}</div>
              <div className="muted small-text">Billed every month</div>
            </button>

            <button
              type="button"
              className={`checkout-option-card ${billingCycle === 'yearly' ? 'selected' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              <div className="checkout-option-title">Yearly</div>
              <div className="checkout-option-price">₹{meta.yearly}</div>
              <div className="muted small-text">Better value</div>
            </button>
          </div>
        </div>

        <div className="soft-card">
          <h3>Payment method</h3>

          <div className="checkout-method-list top24">
            <button
              type="button"
              className={`checkout-method-row ${paymentMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('upi')}
            >
              <span>UPI</span>
              <span className="checkout-method-tag">Fastest</span>
            </button>

            <button
              type="button"
              className={`checkout-method-row ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <span>Card</span>
              <span className="checkout-method-tag">Visa / Mastercard</span>
            </button>

            <button
              type="button"
              className={`checkout-method-row ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('netbanking')}
            >
              <span>Net Banking</span>
              <span className="checkout-method-tag">Bank transfer</span>
            </button>

            <button
              type="button"
              className={`checkout-method-row ${paymentMethod === 'wallet' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('wallet')}
            >
              <span>Wallet</span>
              <span className="checkout-method-tag">App wallet</span>
            </button>
          </div>
        </div>

        <div className="soft-card">
          <h3>Order summary</h3>

          <div className="checkout-summary top24">
            <div className="checkout-summary-row">
              <span>Plan</span>
              <span>{meta.title}</span>
            </div>

            <div className="checkout-summary-row">
              <span>Billing</span>
              <span>{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
            </div>

            <div className="checkout-summary-row">
              <span>Payment method</span>
              <span>{paymentMethod.toUpperCase()}</span>
            </div>

            <div className="checkout-summary-row checkout-summary-total">
              <span>Total</span>
              <span>₹{amount}</span>
            </div>
          </div>

          <button
            className="button primary checkout-pay-button top24"
            onClick={handleMockPayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay ₹${amount}`}
          </button>

          <div className="muted small-text top16 subtle-center">
            This is a mock checkout flow for now. Real gateway integration can replace this handler later.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
