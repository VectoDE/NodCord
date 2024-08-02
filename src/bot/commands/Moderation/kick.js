const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick the user from the server.')
  .addUserOption(option => option.setName('user').setDescription('The user you want to kick.').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user.').setRequired(true)),
  async execute (interaction) {
    const userKick = interaction.options.getUser('user');
    const memberKick = await interaction.guild.members.fetch(userKick.id);

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: "You don't have permissions to kick member from the server." });

    if(!memberKick) return await interaction.reply({ content: "The user you want to kick is not in the server." });

    if(!memberKick.kickable) return await interaction.reply({ content: "I am not able to kick this user." });

    let reason = interaction.options.getString('reason');

    if(!reason) reason = "No reason provided.";

    const embedDM = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`You have been **kicked** from **${interaction.guild.name}** | ${reason}`)

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`Successfully kicked **${userKick.tag}** from the server. | ${reason}`)

    await memberKick.send({ embeds: [embedDM] }).catch(err => {
      return;
    });

    await memberKick.kick({ reason: reason }).catch(err => {
      interaction.reply({ content: "Error", ephemeral: true });
    });

    await interaction.reply({ embeds: [embed] });
  }
}
