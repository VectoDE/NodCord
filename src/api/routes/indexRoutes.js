const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/docs', (req, res) => {
  res.render('documentation');
});

router.get('/status', (req, res) => {
  res.render('status');
});

router.get('/info', (req, res) => {
  res.render('info');
});

router.get('/discord-members', (req, res) => {
  res.render('discordmembers');
});

router.get('/discord-servers', (req, res) => {
  res.render('discordservers');
});

router.get('/socketio', (req, res) => {
  res.render('socketio');
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
