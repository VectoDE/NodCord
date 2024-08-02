const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('This gives you some basic server information.'),
  async execute (interaction) {
    const { guild } = interaction;
    const { members } = guild;
    const { name, ownerId, createdTimestamp, memberCount } = guild;
    const icon = guild.iconURL();

    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const id = guild.id;

    let serverVerification = guild.verificationLevel;

    if(serverVerification == 0) serverVerification = 'None';
    if(serverVerification == 1) serverVerification = 'Low';
    if(serverVerification == 2) serverVerification = 'Medium';
    if(serverVerification == 3) serverVerification = 'High';
    if(serverVerification == 4) serverVerification = 'Very High';

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setThumbnail(icon)
    .setAuthor({ name: name, iconURL: icon })
    .addFields({ name: "Server Name", value: `${name}` })
    .addFields({ name: "Server Members", value: `${memberCount}` })
    .addFields({ name: "Server Emojis", value: `${emojis}` })
    .addFields({ name: "Server ID", value: `${id}` })
    .addFields({ name: "Server Boosts", value: `${guild.premiumSubscriptionCount}` })
    .addFields({ name: "Server Owner", value: `${ownerId}` })
    .addFields({ name: "Server Creation Date", value: `<t:${parseInt(createdTimestamp / 1000)}:R>` })
    .setTimestamp()

    await interaction.reply({ embeds: [embed] });
  }
}
