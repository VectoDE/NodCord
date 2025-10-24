const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('checkinvites')
  .setDescription('Checks the user invites.')
  .addUserOption(option => option.setName('user').setDescription('The user you want to check invites of.').setRequired(true)),
  async execute(interaction, message) {
    const user = interaction.options.getUser('user');
    let invites = await interaction.guild.invites.fetch();
    let userInvites = invites.filter(user => user.inviter && user.inviter.id === user.id);

    let inv = 0;
    userInvites.forEach(invite => inv += invite.uses);

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`**${user.tag}** has **${inv}** invites.`);

    await interaction.reply({ embeds: [embed] });
  }
}
