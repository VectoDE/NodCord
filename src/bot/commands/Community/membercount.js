const { SlashCommandBuilder, EmbedBuilder, PermissionsFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('membercount')
  .setDescription('Shows number of members in the server.')
  .setDefaultMemberPermissions(PermissionsFlagsBits.SendMessages),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
    .setTitle(`${interaction.guild.name}`)
    .addFields([
      {
        name: "Total Members",
        value: `${interaction.guild.memberCount}`,
      },
      {
        name: "Total Bots",
        value: `${interaction.guild.members.cache.filter(member => member.user.bot).size}`,
      },
      {
        name: "Humans",
        value: `${interaction.guild.members.cache.filter(member => !member.user.bot).size}`,
      },
    ])
    .setColor('Random')
    .setThumbnail(client.user.displayAvatarURL())
    .setFooter({ text: `${interaction.guild.name}` })

    await interaction.reply({ embeds: [embed] });
  }
}
