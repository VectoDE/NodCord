require('dotenv').config();
const botConfig = require('./config/botConfig');
const connectDB = require('./database/connectDB');
const app = require('./api/app');
const client = require('./bot/index');

// Connect to the database first
connectDB().then(() => {
    // Start the API server
    app.listen(app.get('port'), () => {
        console.log(`API server running on port ${app.get('port')}`);
    });

    // Start the bot
    client.login(botConfig.token).then(() => {
        console.log('Bot logged in successfully.');
    }).catch(err => {
        console.error('Error logging in the bot:', err);
    });
});
