const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-remove')
    .setDescription('Remove any role to any member.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Select a member to assign a role to.')
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role you want to remove from the member.')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have permissions to run this command.",
        ephemeral: true,
      });

    const member = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    if (!member.roles.cache.has(role.id)) {
      return await interaction.reply({
        content: "Member don't have that role.",
        ephemeral: true,
      });
    } else {
      member.roles.remove(role).catch(console.error);
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`**${role}** has been **removed** to **${member}**.`)
          .setColor('Random'),
      ],
    });
  },
};
