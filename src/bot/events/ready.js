const fs = require('fs');
const Table = require('cli-table3');

const greenArrow = '✔'; // Grüner Häkchen
const redCross = '✘'; // Rotes Kreuz

module.exports = (client) => {
  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!\n`);

    // Liste alle Befehle
    const commands = Array.from(client.commands.values()).map((cmd) => ({
      name: cmd.data.name,
      active: true, // assuming all registered commands are active
    }));

    // Liste alle Events
    const eventFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('.js'))
      .map((file) => ({
        name: file.replace('.js', ''),
        active: true, // assuming all event files are active
      }));

    // Erstelle eine Tabelle für Befehle
    const commandsTable = new Table({
      head: ['Command Name', 'Status'],
      colWidths: [30, 10],
    });

    commands.forEach((cmd) => {
      commandsTable.push([cmd.name, cmd.active ? greenArrow : redCross]);
    });

    // Erstelle eine Tabelle für Events
    const eventsTable = new Table({
      head: ['Event Name', 'Status'],
      colWidths: [30, 10],
    });

    eventFiles.forEach((event) => {
      eventsTable.push([event.name, event.active ? greenArrow : redCross]);
    });

    // Log die Tabellen
    console.log('Commands:');
    console.log(commandsTable.toString());

    console.log('\nEvents:');
    console.log(eventsTable.toString());

    // Log die Startzeit des Bots
    const startTime = new Date();
    console.log(`\nBot started in ${Date.now() - startTime}ms`);
  });
};
