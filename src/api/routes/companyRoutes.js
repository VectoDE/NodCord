const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.listCompanies);

router.get('/:companyId', companyController.getCompanyDetails);

router.post('/create', companyController.createCompany);

router.post('/:companyId/update', companyController.updateCompany);

router.post('/:companyId/delete', companyController.deleteCompany);

module.exports = router;
