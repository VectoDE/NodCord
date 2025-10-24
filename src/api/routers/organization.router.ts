const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

router.get('/', organizationController.getAllOrganizations);

router.get('/:organizationId', organizationController.getOrganizationById);

router.post('/create', organizationController.createOrganization);

router.post('/:organizationId/update', organizationController.updateOrganization);

router.post('/:organizationId/delete', organizationController.deleteOrganization);

module.exports = router;
