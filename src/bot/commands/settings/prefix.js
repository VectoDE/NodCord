const { EmbedBuilder } = require('discord.js');
const Prefix = require('../../../models/prefixModel');

module.exports = {
  data: {
    name: 'prefix',
    description: 'Ändert das Prefix für diesen Server.',
    options: [
      {
        type: 3, // STRING type
        name: 'prefix',
        description: 'Das neue Prefix.',
        required: true,
      },
    ],
    category: 'Utility',
  },
  async execute(interaction) {
    const newPrefix = interaction.options.getString('prefix');
    const guildId = interaction.guild.id;

    try {
      // Find the existing prefix document for the guild or create a new one
      let prefixDoc = await Prefix.findOne({ guildId });
      if (prefixDoc) {
        prefixDoc.prefix = newPrefix;
      } else {
        prefixDoc = new Prefix({ guildId, prefix: newPrefix });
      }
      await prefixDoc.save();

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Prefix geändert')
        .setDescription(`Das Prefix wurde erfolgreich auf ${newPrefix} geändert.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error updating prefix:', error);
      await interaction.reply({ content: 'Ein Fehler ist aufgetreten beim Ändern des Prefix.', ephemeral: true });
    }
  },
};
