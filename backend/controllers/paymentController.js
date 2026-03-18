import razorpay from '../../config/razorpay.js';

export async function createOrder(req, res) {
  try {
    const { plan, billingCycle = 'monthly' } = req.body;

    const amountMap = {
      premium: billingCycle === 'yearly' ? 99900 : 14900,
      pro: billingCycle === 'yearly' ? 179900 : 24900,
    };

    const amount = amountMap[plan];

    if (!amount) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${plan}_${billingCycle}_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Order failed' });
  }
}
