import crypto from 'crypto';
import razorpay from '../../config/razorpay.js';
import User from '../models/User.js';

function getPlanAmount(plan, billingCycle = 'monthly') {
  const priceMap = {
    premium: {
      monthly: 14900,
      yearly: 99900,
    },
    pro: {
      monthly: 24900,
      yearly: 179900,
    },
  };

  return priceMap?.[plan]?.[billingCycle] || null;
}

function getExpiryDate(billingCycle = 'monthly') {
  const now = new Date();

  if (billingCycle === 'yearly') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }

  return now;
}

export async function createOrder(req, res) {
  try {
    const { plan, billingCycle = 'monthly' } = req.body;

    const amount = getPlanAmount(plan, billingCycle);

    if (!amount) {
      return res.status(400).json({ message: 'Invalid plan or billing cycle' });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${plan}_${billingCycle}_${Date.now()}`,
      notes: {
        userId: String(req.user._id),
        plan,
        billingCycle,
      },
    });

    return res.json(order);
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Order failed' });
  }
}

export async function verifyPayment(req, res) {
  try {
    const {
      plan,
      billingCycle = 'monthly',
      paymentMethod = '',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !plan ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const expectedAmount = getPlanAmount(plan, billingCycle);

    if (!expectedAmount) {
      return res.status(400).json({ message: 'Invalid plan or billing cycle' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const expiresAt = getExpiryDate(billingCycle);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        plan,
        subscription: {
          provider: 'razorpay',
          status: 'active',
          billingCycle,
          paymentMethod,
          amount: expectedAmount / 100,
          startedAt: new Date(),
          expiresAt,
          autoRenew: false,
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    return res.json({
      message: 'Payment verified successfully',
      user,
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ message: 'Payment verification failed' });
  }
}
