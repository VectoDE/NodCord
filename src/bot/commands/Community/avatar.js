const { SlashCommandBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('Displays the avatar of a user.')
  .addUserOption(option => option.setName('user').setDescription('The user whose avatar to display.')),
  async execute (interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 });

    const embed = new EmbedBuilder()
    .setTitle(`${user.username}'s Avatar`)
    .setImage(avatarUrl);

    await interaction.reply({ embeds: [embed] });
  }
}
