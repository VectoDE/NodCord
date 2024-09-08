const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware(true));

router.get('/', roleMiddleware(['admin']), roleController.getAllRoles);

router.get('/:roleId', roleMiddleware(['admin']), roleController.getRoleById);

router.post('/create', roleMiddleware(['admin']), roleController.createRole);

router.post('/:roleId/update', roleMiddleware(['admin']), roleController.updateRole);

router.post('/:roleId/delete', roleMiddleware(['admin']), roleController.deleteRole);

module.exports = router;
