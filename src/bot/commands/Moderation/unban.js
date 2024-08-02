const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('unban')
  .setDescription('To unban user from the server.')
  .addUserOption(option => option.setName('user').setDescription('The user you want to unban.').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('The reason for unbanning the user.').setRequired(false)),
  async execute (interaction) {
    const userId = interaction.options.getUser('user');

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "You don't have permissions to unban users." });

    let reason = interaction.options.getUser('reason');

    if(!reason) reason = 'No reason provided.';

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`Successfully unbanned **${userId}** | ${reason}`)

    await interaction.guild.bans.fetch().then(async bans => {
      if(bans.size == 0) return await interaction.reply({ content: "There is no banned user." });

      let bannedID = bans.find(ban => ban.user.id == userId);
      if(!bannedID) return await interaction.reply({ content: "The ID you give is not banned from this server." });

      await interaction.guild.bans.remove(userId, reason).catch(err => {
        return interaction.reply({ content: "I can't unban this user." });
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
}
