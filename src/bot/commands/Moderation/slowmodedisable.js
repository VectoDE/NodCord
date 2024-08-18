const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('slowmode-disable')
  .setDescription('Disable the slowmode of the channel.')
  .addIntegerOption(option => option.setName('duration').setDescription('Time of slowmode. (Give 0 to disable)').setRequired(true))
  .addChannelOption(option => option.setName('channel').setDescription('The channel you want to disable the slowmode.').addChannelTypes(ChannelType.GuildText).setRequired(false)),
  async execute(interaction) {
    const { options } = interaction;
    const duration = options.getInteger('duration');
    const channel = options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
    .setColor('Random')
    .setDescription(`${channel} now has **${duration}** seconds of slowmode.`);

    channel.setRateLimitPerUser(duration).catch(err => {
      return;
    });

    await interaction.reply({ embeds: [embed] });
  }
}
