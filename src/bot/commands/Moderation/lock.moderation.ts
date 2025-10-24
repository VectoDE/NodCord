const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the specific channel.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Select the channel you want to lock.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: "You don't have permissions to lock the channels.",
      });

    let channel = interaction.options.getChannel('channel');
    channel.permissionOverwrites.create(interaction.guild.id, {
      SendMessages: false,
    });

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(`Successfully **locked** ${channel}`);

    await interaction.reply({ embeds: [embed] });
  },
};
