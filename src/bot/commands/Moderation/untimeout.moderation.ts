const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('untimeout')
  .setDescription('Remove timeout from user.')
  .addUserOption(option => option.setName('user').setDescription('Select the user.').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Provide a reason for untimeout.').setRequired(true)),
  async execute (interaction) {
    const user = interaction.options.getUser('user');
    const timeMember = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.getString('reason') || "No reason provided.";

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "You do not have permissions to use this command." });

    await timeMember.timeout(null, reason);

    const embed = new EmbedBuilder()
    .setDescription(`Successfully untimeout **${user.tag}** | ${reason}`);

    const dmEmbed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`You have been **untimedout** in **${interaction.guild.name}** | ${reason}`)

    await timeMember.send({ embeds: [dmEmbed] }).catch(err => {
      return;
    });

    await interaction.reply({ embeds: [embed] });
  }
}
