const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.get('/', returnController.getAllReturns);

router.get('/:returnId', returnController.getReturnById);

router.post('/create', returnController.createReturn);

router.post('/:returnId/update', returnController.updateReturn);

router.post('/:returnId/delete', returnController.deleteReturn);

module.exports = router;
