const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stats')
  .setDescription('Gives you the both stats!'),
  async execute (interaction, client) {
    const name = `${client.user.username}`;
    const icon = `${client.user.displayAvatarURL()}`;
    let servercount = await client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);

    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    let uptime = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
    let ping = `${Date.now() - interaction.createdTimestamp}ms.`;

    const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
      .setLabel('Support Server')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.gg/Up4cjENT7n`),

      new ButtonBuilder()
      .setLabel('Invite Me')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=${PermissionsBitField.Flags.Administrator}`)
    )

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setAuthor({ name: name, iconURL: icon })
    .setThumbnail(`${icon}`)
    .addFields({ name: "Server Numbers", value: `${client.guilds.cache.size}`, inline: false })
    .addFields({ name: "Server Members", value: `${servercount}`, inline: false })
    .addFields({ name: "Latency", value: `${ping}` })
    .addFields({ name: "Uptime", value: `\`\`\`${uptime}\`\`\``, inline: true })
    .setFooter({ text: `Bot ID: ${client.user.id}` })
    .setTimestamp()

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
