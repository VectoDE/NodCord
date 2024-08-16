const express = require('express');
const router = express.Router();
const bugController = require('../controllers/bugController');

router.post('/create', bugController.createBug);

router.get('/', bugController.getAllBugs);

router.get('/:id', bugController.getBugById);

router.put('/update/:id', bugController.updateBug);

router.delete('/delete/:id', bugController.deleteBug);

module.exports = router;
