const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('This gives you some basic server information.'),
  async execute(interaction) {
    const { guild } = interaction;
    const { members } = guild;
    const { name, ownerId, createdTimestamp, memberCount } = guild;
    const icon = guild.iconURL();

    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const id = guild.id;

    let serverVerification = guild.verificationLevel;

    if (serverVerification === 0) serverVerification = 'None';
    if (serverVerification === 1) serverVerification = 'Low';
    if (serverVerification === 2) serverVerification = 'Medium';
    if (serverVerification === 3) serverVerification = 'High';
    if (serverVerification === 4) serverVerification = 'Very High';

    const owner = await guild.fetchOwner();
    const ownerName = owner.user.username;

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setThumbnail(icon)
      .setAuthor({ name: name, iconURL: icon })
      .addFields(
        { name: 'Server Name', value: `${name}` },
        { name: 'Server Members', value: `${memberCount}` },
        { name: 'Server Emojis', value: `${emojis}` },
        { name: 'Server Roles', value: `${roles}` },
        { name: 'Server Verification', value: `${serverVerification}` },
        { name: 'Server Boosts', value: `${guild.premiumSubscriptionCount}` },
        { name: 'Server ID', value: `${id}` },
        { name: 'Server Owner', value: `${ownerName} (||${ownerId}||)` },
        {
          name: 'Server Creation Date',
          value: `<t:${parseInt(createdTimestamp / 1000)}:R>`,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
