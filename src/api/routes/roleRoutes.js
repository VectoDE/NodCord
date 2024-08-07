const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware(true));

router.get('/', roleMiddleware(['admin']), roleController.getAllRoles);

router.post('/', roleMiddleware(['admin']), roleController.createRole);

module.exports = router;
