module.exports = {
  data: {
      name: 'setticketchannel',
      description: 'Setzt den Kanal, in dem das Ticket-Panel angezeigt wird.',
      category: 'Ticket',
      options: [
          {
              type: 7, // CHANNEL type
              name: 'channel',
              description: 'Der Kanal, in dem das Ticket-Panel angezeigt werden soll.',
              required: true,
          }
      ],
  },
  async execute(interaction) {
      const channel = interaction.options.getChannel('channel');

      if (channel.type !== 'GUILD_TEXT') {
          return interaction.reply({ content: 'Bitte wähle einen Textkanal!', ephemeral: true });
      }

      // Setze den Kanal in den Datenbank oder den Bot-Settings
      // Hier wird eine hypothetische Methode `setTicketChannel` verwendet
      await interaction.client.db.setTicketChannel(interaction.guild.id, channel.id);

      await interaction.reply({ content: `Der Ticket-Panel-Kanal wurde auf <#${channel.id}> gesetzt.`, ephemeral: true });
  },
};
