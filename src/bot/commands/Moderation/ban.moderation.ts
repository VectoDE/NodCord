const {
  PermissionsBitField,
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban the user from the server.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user you want to ban.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason for banning the user.')
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const users = interaction.options.getUser('user');
    const id = users.id;
    const userBan = client.users.cache.get(id);

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    )
      return await interaction.reply({
        content: "You don't have permissions to ban members in this server.",
      });

    if (interaction.member.id === id)
      return await interaction.reply({ content: "You can't ban yourself." });

    let reason = interaction.options.getString('reason');

    if (!reason) reason = 'No reason provided.';

    const embedDM = new EmbedBuilder()
      .setColor('Random')
      .setDescription(
        `You have been **banned** from **${interaction.guild.name}** | ${reason}`
      );

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(`Successfully banned **${userBan.tag}** | ${reason}`);

    await userBan.send({ embeds: [embedDM] }).catch((err) => {
      return;
    });

    await interaction.guild.bans.create(userBan.id, { reason }).catch((err) => {
      return interaction.reply({ content: "I can't ban this user." });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
