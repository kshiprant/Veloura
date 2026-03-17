import User from '../models/User.js';

export async function completeMockCheckout(req, res) {
  try {
    const { plan, billingCycle, paymentMethod, amount } = req.body;

    if (!['premium', 'pro'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ message: 'Invalid billing cycle' });
    }

    if (!['upi', 'card', 'netbanking', 'wallet'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const now = new Date();
    const expiresAt = new Date(now);

    if (billingCycle === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        plan,
        subscription: {
          provider: 'mock',
          status: 'active',
          billingCycle,
          paymentMethod,
          amount,
          startedAt: now,
          expiresAt,
          autoRenew: true,
        },
      },
      { new: true }
    ).select('-password');

    return res.json({
      message: 'Payment completed successfully',
      user,
    });
  } catch (error) {
    console.error('completeMockCheckout error:', error);
    return res.status(500).json({ message: 'Failed to complete checkout' });
  }
}
