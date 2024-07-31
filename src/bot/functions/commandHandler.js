const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();
  const commandsPath = path.join(__dirname, '../commands');

  const loadCommands = (dir) => {
    const fullPath = path.join(commandsPath, dir);
    const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(fullPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`Command ${file} is missing required properties`);
      }
    }
  };

  const categories = fs.readdirSync(commandsPath).filter(dir => fs.statSync(path.join(commandsPath, dir)).isDirectory());
  for (const category of categories) {
    loadCommands(category);
  }

  // Debugging: Überprüfe, ob Befehle korrekt geladen sind
  console.log('Commands loaded:', [...client.commands.keys()]);
};
