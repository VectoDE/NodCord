const Company = require('../../models/companyModel');

// Listet alle Unternehmen auf
const listCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Erstellt ein neues Unternehmen
const createCompany = async (req, res) => {
    try {
        const { name, description, industry, headquarters, foundedDate, employees, website } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const newCompany = new Company({
            name,
            description,
            industry,
            headquarters,
            foundedDate,
            employees,
            website
        });

        await newCompany.save();
        res.status(201).json(newCompany);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Zeigt Details eines bestimmten Unternehmens an
const getCompanyDetails = async (req, res) => {
    try {
        const { companyId } = req.params;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Aktualisiert ein Unternehmen
const updateCompany = async (req, res) => {
    try {
        const { companyId, name, description, industry, headquarters, foundedDate, employees, website } = req.body;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (name) company.name = name;
        if (description) company.description = description;
        if (industry) company.industry = industry;
        if (headquarters) company.headquarters = headquarters;
        if (foundedDate) company.foundedDate = foundedDate;
        if (employees) company.employees = employees;
        if (website) company.website = website;

        company.updatedDate = Date.now();

        await company.save();
        res.status(200).json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Entfernt ein Unternehmen
const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.body;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        await company.remove();
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listCompanies,
    createCompany,
    getCompanyDetails,
    updateCompany,
    deleteCompany
};