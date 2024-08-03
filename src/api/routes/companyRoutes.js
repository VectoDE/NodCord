const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.listCompanies);

router.post('/', companyController.createCompany);

router.get('/:companyId', companyController.getCompanyDetails);

router.put('/update', companyController.updateCompany);

router.delete('/delete', companyController.deleteCompany);

module.exports = router;
