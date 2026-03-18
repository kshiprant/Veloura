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
  const { user, setUser } = useAuth();

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

  const handlePayment = async () => {
    try {
      setProcessing(true);

      const { data: order } = await api.post('/payments/create-order', {
        plan: planKey,
        billingCycle,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Veloura',
        description: `${meta.title} - ${billingCycle}`,
        order_id: order.id,
        prefill: {
          name: user?.firstName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#8a1538',
        },
        handler: async function (response) {
          try {
            const { data } = await api.post('/payments/verify', {
              plan: planKey,
              billingCycle,
              paymentMethod,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (data?.user) {
              setUser(data.user);
            }

            alert('Payment verified successfully');
            navigate('/profile');
          } catch (error) {
            console.error('Verification failed:', error);
            alert(error?.response?.data?.message || 'Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      if (!window.Razorpay) {
        alert('Razorpay SDK failed to load');
        setProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment failed:', error);
      alert(error?.response?.data?.message || 'Payment failed');
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
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay ₹${amount}`}
          </button>

          <div className="muted small-text top16 subtle-center">
            Secure payment via Razorpay
          </div>
        </div>
      </div>
    </AppShell>
  );
}
