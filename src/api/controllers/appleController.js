const appleService = require('../services/appleService');
const logger = require('../services/loggerService');

class AppleController {
  async getProduct(req, res) {
    try {
      const { productId } = req.params;
      const product = await appleService.getAppleProduct(productId);
      res.status(200).json(product);
    } catch (error) {
      logger.error('Failed to get Apple product', { error });
      res.status(500).json({ error: 'Failed to get Apple product' });
    }
  }

  async createPayment(req, res) {
    try {
      const paymentData = req.body;
      const payment = await appleService.createApplePayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      logger.error('Failed to create Apple payment', { error });
      res.status(500).json({ error: 'Failed to create Apple payment' });
    }
  }

  async verifyPurchase(req, res) {
    try {
      const purchaseData = req.body;
      const verification = await appleService.verifyApplePurchase(purchaseData);
      res.status(200).json(verification);
    } catch (error) {
      logger.error('Failed to verify Apple purchase', { error });
      res.status(500).json({ error: 'Failed to verify Apple purchase' });
    }
  }
}

module.exports = new AppleController();