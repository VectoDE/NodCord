const Payment = require('../../models/paymentModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', // 'sandbox' or 'live'
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET,
});

const listPayments = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const payments = await Payment.find({ userId });
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const { userId, amount, method, token, payerId, returnUrl, cancelUrl } = req.body;
    if (!userId || !amount || !method) {
      return res.status(400).json({ error: 'User ID, Amount, and Method are required' });
    }

    let transactionId;
    let paymentStatus;

    if (method === 'credit_card') {
      const charge = await stripe.charges.create({
        amount: amount * 100,
        currency: 'usd',
        source: token,
        description: 'Payment for your order',
      });
      transactionId = charge.id;
      paymentStatus = charge.status;

    } else if (method === 'paypal') {
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        transactions: [{
          amount: {
            total: amount,
            currency: 'USD',
          },
          description: 'Payment for your order',
        }],
        redirect_urls: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: error.message });
        } else {
          transactionId = payment.id;
          paymentStatus = payment.state;
          res.json({ payment });
        }
      });

      return;

    } else if (method === 'apple_pay' || method === 'google_pay' || method === 'amazon_pay') {
      transactionId = 'mock_transaction_id';
      paymentStatus = 'completed';

    } else if (method === 'bank_transfer') {
      transactionId = 'mock_transaction_id';
      paymentStatus = 'completed';

    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const newPayment = new Payment({
      userId,
      amount,
      method,
      status: paymentStatus,
      transactionId
    });

    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const paypalSuccess = async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [{
        amount: {
          currency: 'USD',
          total: req.query.amount,
        },
      }],
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      } else {
        const newPayment = new Payment({
          userId: payment.payer.payer_info.payer_id,
          amount: payment.transactions[0].amount.total,
          method: 'paypal',
          status: payment.state,
          transactionId: payment.id
        });

        await newPayment.save();
        res.status(200).json(newPayment);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const paypalCancel = (req, res) => {
  res.status(400).json({ message: 'Payment canceled' });
};

module.exports = {
  listPayments,
  createPayment,
  paypalSuccess,
  paypalCancel,
};
