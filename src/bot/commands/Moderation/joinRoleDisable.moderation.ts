const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const joinrole = require('../../../models/joinroleModel');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('joinrole-disable')
  .setDescription('Disable auto role system for your server.'),
  async execute(interaction) {
    const data = await joinrole.findOne({ Guild: interaction.guild.id });

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "You do not have permissions to run this command." });

    if(!data) {
      return await interaction.reply({ content: "No join role has been set." });
    } else {
      joinrole.deleteMany({ Guild: interaction.guild.id }, async (err, data) => {
        if (err) throw err;

        const embed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`Successfully disabled **auto roles** in this server.`)
        .setFooter({ text: `${interaction.guild.name}` })
        .setTimestamp();

        return interaction.reply({ embds: [embed] });
      });
    }
  }
}
