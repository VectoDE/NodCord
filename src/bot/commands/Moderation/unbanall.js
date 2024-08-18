const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('unban-all')
  .setDescription('Unban all member from the server.'),
  async execute(interaction) {
    const { options, guild } = interaction;
    const { ownerId } = guild;
    const users = await interaction.guild.bans.fetch();
    const ids = users.map(user => user.user.id);

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "You do not have permissions to use this command." });

    if(users.size === 0) return await interaction.reply({ content: "There is no one banned from this server." });

    await interaction.reply({ content: "Unbanning everyone in this server..." });

    for(const id of ids) {
      await guild.members.unban(id).catch(err => {
        return interaction.reply({ content: `${err.rawError}` });
      });
    }

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`Successfully unbanned **${ids.length}** members from this server.`);

    await interaction.editReply({ content: "", embeds: [embed] });
  }
}
