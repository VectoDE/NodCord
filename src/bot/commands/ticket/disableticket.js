module.exports = {
  data: {
      name: 'disableticket',
      description: 'Deaktiviert das Ticket-System und entfernt die Ticket-Kategorie und den Ticket-Panel-Kanal.',
      category: 'Ticket',
  },
  async execute(interaction) {
      const guildId = interaction.guild.id;

      // Entferne die Ticket-Kategorie und den Ticket-Kanal aus der Datenbank oder den Bot-Settings
      await interaction.client.db.removeTicketCategory(guildId);
      await interaction.client.db.removeTicketChannel(guildId);

      // Bestätigungsnachricht
      await interaction.reply({ content: 'Das Ticket-System wurde deaktiviert. Alle Ticket-Kanäle und -Kategorien wurden entfernt.', ephemeral: true });
  },
};
