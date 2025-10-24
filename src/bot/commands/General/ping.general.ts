const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Displays the bot's ping and latency."),
  async execute(interaction) {
    const startTime = Date.now();

    await interaction.reply('Pinging...');

    const endTime = Date.now();
    const latency = endTime - startTime;

    const pingEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🏓 Pong!')
      .setDescription(`Bot Latency: ${latency}ms`)
      .setTimestamp();

    await interaction.editReply({ embeds: [pingEmbed] });
  },
};
