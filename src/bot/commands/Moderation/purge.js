const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('purge')
  .setDescription('This purges channel messages.')
  .addIntegerOption(option => option.setName('amount').setDescription('The amount of messages you want to delete.').setMinValue(1).setMaxValue(100).setRequired(true)),
  async execute (interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: "You don't have permissions to purges messages.", ephemeral: true });

    let number = interaction.options.getInteger('amount');

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`Successfully deleted ${number} messages.`)

    await interaction.channel.bulkDelete(number);

    interaction.reply({ embeds: [embed] });
  }
}
