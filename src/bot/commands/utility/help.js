const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'help',
    description: 'Listet alle verfügbaren Befehle nach Kategorien auf.',
    category: 'Utility',
  },
  async execute(interaction) {
    const { commands } = interaction.client;
    const categories = new Set();

    console.log('Verfügbare Befehle:', [...commands.keys()]);

    if (commands.size === 0) {
      console.error('Keine Befehle gefunden. Überprüfe den Command Handler.');
      await interaction.reply({ content: 'Keine Befehle gefunden. Überprüfe den Command Handler.', ephemeral: true });
      return;
    }

    // Kategorien herausfinden
    commands.forEach((command) => {
      if (command.data && command.data.name) {
        const category = command.data.category || 'Miscellaneous';
        categories.add(category);
      }
    });

    // Erstelle das Embed
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Verfügbare Befehle')
      .setDescription('Hier sind die verfügbaren Befehle nach Kategorien:');

    // Befehle nach Kategorien sortieren
    let hasCommands = false; // Überprüft, ob Befehle hinzugefügt wurden

    for (const category of categories) {
      let commandsList = '';
      commands.forEach((command) => {
        if (command.data && command.data.category === category) {
          commandsList += `\`${command.data.name}\`: ${command.data.description}\n`;
          hasCommands = true;
        }
      });

      if (commandsList) {
        embed.addFields({ name: category, value: commandsList });
      }
    }

    // Falls keine Befehle angezeigt werden, gebe eine entsprechende Nachricht aus
    if (!hasCommands) {
      embed.setDescription('Keine Befehle verfügbar.');
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
