const Payment = require('../../models/paymentModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const logger = require('../services/loggerService');

paypal.configure({
  mode: 'sandbox', // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// TODO: Function Controller

const listPayments = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      logger.warn('User ID is required');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const payments = await Payment.find({ userId });
    logger.info(`Fetched ${payments.length} payments for user ${userId}`);
    res.status(200).json(payments);
  } catch (error) {
    logger.error('Error listing payments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createPayment = async (req, res) => {
  try {
    const { userId, amount, method, token, payerId, returnUrl, cancelUrl } =
      req.body;
    if (!userId || !amount || !method) {
      logger.warn('User ID, Amount, and Method are required');
      return res
        .status(400)
        .json({ error: 'User ID, Amount, and Method are required' });
    }

    let transactionId;
    let paymentStatus;

    switch (method) {
      case 'credit_card':
        const charge = await stripe.charges.create({
          amount: amount * 100,
          currency: 'usd',
          source: token,
          description: 'Payment for your order',
        });
        transactionId = charge.id;
        paymentStatus = charge.status;
        logger.info(`Credit card payment created: ${transactionId}`);
        break;

      case 'paypal':
        const create_payment_json = {
          intent: 'sale',
          payer: {
            payment_method: 'paypal',
          },
          transactions: [
            {
              amount: {
                total: amount,
                currency: 'USD',
              },
              description: 'Payment for your order',
            },
          ],
          redirect_urls: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        };

        paypal.payment.create(create_payment_json, (error, payment) => {
          if (error) {
            logger.error('PayPal payment creation error:', error);
            return res.status(500).json({ error: error.message });
          } else {
            transactionId = payment.id;
            paymentStatus = payment.state;
            logger.info(`PayPal payment created: ${transactionId}`);
            res.json({ payment });
          }
        });

        return;

      case 'apple_pay':
      case 'google_pay':
      case 'amazon_pay':
      case 'bank_transfer':
        transactionId = 'mock_transaction_id';
        paymentStatus = 'completed';
        logger.info(`Mock payment created with method ${method}`);
        break;

      default:
        logger.warn('Invalid payment method');
        return res.status(400).json({ error: 'Invalid payment method' });
    }

    const newPayment = new Payment({
      userId,
      amount,
      method,
      status: paymentStatus,
      transactionId,
    });

    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const paypalSuccess = async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: 'USD',
            total: req.query.amount,
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async (error, payment) => {
        if (error) {
          logger.error('PayPal payment execution error:', error);
          return res.status(500).json({ error: error.message });
        } else {
          const newPayment = new Payment({
            userId: payment.payer.payer_info.payer_id,
            amount: payment.transactions[0].amount.total,
            method: 'paypal',
            status: payment.state,
            transactionId: payment.id,
          });

          await newPayment.save();
          logger.info(`PayPal payment executed successfully: ${payment.id}`);
          res.status(200).json(newPayment);
        }
      }
    );
  } catch (error) {
    logger.error('Error handling PayPal success:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const paypalCancel = (req, res) => {
  logger.info('PayPal payment canceled');
  res.status(400).json({ message: 'Payment canceled' });
};

module.exports = {
  listPayments,
  createPayment,
  paypalSuccess,
  paypalCancel,
};
