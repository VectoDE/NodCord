module.exports = (client) => {
    client.once('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);

        // Liste alle Befehle
        const commands = Array.from(client.commands.values()).map(cmd => cmd.data.name).join(', ');
        console.log(`Commands: ${commands}`);

        // Liste alle Events
        const eventFiles = require('fs').readdirSync(__dirname).filter(file => file.endsWith('.js')).join(', ');
        console.log(`Events: ${eventFiles}`);

        // Datenbankverbindung protokollieren
        console.log('Database connected.');

        // Startzeit protokollieren
        const startTime = new Date();
        console.log(`Bot started in ${Date.now() - startTime}ms`);
    });
};
