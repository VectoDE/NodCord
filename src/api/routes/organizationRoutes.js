const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

router.get('/', organizationController.getAllOrganizations);

router.get('/:id', organizationController.getOrganizationById);

router.post('/create', organizationController.createOrganization);

router.put('/update/:id', organizationController.updateOrganization);

router.delete('/delete/:id', organizationController.deleteOrganization);

module.exports = router;
