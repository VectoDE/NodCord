const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('To warn people in the server.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user you want to warn.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason to warn the user.')
        .setRequired(false)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have permissions to use this command",
        ephemeral: true,
      });

    const member = interaction.options.getUser('user');
    let reason = interaction.options.getString('reason');

    if (!reason) reason = 'No reason provided';

    const dmSend = new EmbedBuilder()
      .setColor('Random')
      .setDescription(
        `You have been warned in ${interaction.guild.name} | ${reason}`
      );

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(`Successfully warned ${member} | ${reason}`);

    await interaction.reply({ embeds: [embed] });

    await member.send({ embeds: [dmSend] }).catch((err) => {
      return;
    });
  },
};
