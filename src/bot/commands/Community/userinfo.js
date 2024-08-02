const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Gives you the user information.')
  .addUserOption(option => option.setName('user').setDescription('The user you want to get information of.').setRequired(false)),
  async execute (interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const icon = user.displayAvatarURL();

    const tag = user.tag;

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setAuthor({ name: tag, iconURL: icon })
    .setThumbnail(icon)
    .addFields({ name: "Member", value: `${user}`, inline: true })
    .addFields({ name: "Roles", value: `${member.roles.cache.map(r => r).join(" ")}`, inline: true })
    .addFields({ name: "Joined Discord", value: `<t:${parseInt(user.createdAt / 1000)}:R>`, inline: false })
    .addFields({ name: "Joined Server", value: `<t:${parseInt(member.joinedAt / 1000)}:R>`, inline: false })
    .setFooter({ text: `User ID: ${user.id}` })
    .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
