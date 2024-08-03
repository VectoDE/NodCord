const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Listet alle Unternehmen auf
router.get('/', companyController.listCompanies);

// Erstellt ein neues Unternehmen
router.post('/', companyController.createCompany);

// Zeigt Details eines bestimmten Unternehmens an
router.get('/:companyId', companyController.getCompanyDetails);

// Aktualisiert ein Unternehmen
router.put('/update', companyController.updateCompany);

// Entfernt ein Unternehmen
router.delete('/delete', companyController.deleteCompany);

module.exports = router;
