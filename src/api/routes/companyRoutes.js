const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.listCompanies);

router.post('/create', companyController.createCompany);

router.get('/:companyId', companyController.getCompanyDetails);

router.put('/update/:id', companyController.updateCompany);

router.delete('/delete/:id', companyController.deleteCompany);

module.exports = router;
