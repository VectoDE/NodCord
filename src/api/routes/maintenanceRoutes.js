const express = require('express');
const router = express.Router();

router.get('/maintenance-new-site', (req, res) => {
  res.render('maintenance/maintenanceNewSite', {
    discord: 'https://discord.gg/example',
    twitter: 'https://twitter.com/example',
    facebook: 'https://facebook.com/example'
  });
});

router.get('/maintenance-change', (req, res) => {
  res.render('maintenance/maintenanceChange', {
    discord: 'https://discord.gg/example',
    twitter: 'https://twitter.com/example',
    facebook: 'https://facebook.com/example'
  });
});

router.get('/maintenance-update', (req, res) => {
  res.render('maintenance/maintenanceUpdate', {
    endDate: '25. August 2024',
    endTime: '02:00 PM',
    discord: 'https://discord.gg/example',
    twitter: 'https://twitter.com/example',
    facebook: 'https://facebook.com/example'
  });
});

router.get('/maintenance-release', (req, res) => {
  res.render('maintenance/maintenanceRelease', {
    title: 'Release-Wartung',
    description: 'Wir führen Wartungsarbeiten für unser nächstes großes Release durch.',
    startDate: '25. August 2024',
    startTime: '10:00 AM',
    endDate: '31. December 2024',
    endTime: '02:00 PM',
    discord: 'https://discord.gg/example',
    twitter: 'https://twitter.com/example',
    facebook: 'https://facebook.com/example',
    preview: 'Hier ist eine Vorschau auf die neuen Funktionen, die wir veröffentlichen werden...',
    endDateTime: '2024-12-31T23:59:59'
  });
});

module.exports = router;
