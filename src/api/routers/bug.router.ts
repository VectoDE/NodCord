const express = require('express');
const router = express.Router();
const bugController = require('../controllers/bugController');

router.get('/', bugController.getAllBugs);

router.get('/:bugId', bugController.getBugById);

router.post('/create', bugController.createBug);

router.post('/:bugId/update', bugController.updateBug);

router.post('/:bugId/delete', bugController.deleteBug);

module.exports = router;
