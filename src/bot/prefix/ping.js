const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Displays the bot\'s ping and latency.',
  run: async (client, message, args) => {
    const startTime = Date.now();

    const replyMessage = await message.reply('Pinging...');

    const endTime = Date.now();
    const latency = endTime - startTime;

    const pingEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🏓 Pong!')
      .setDescription(`Bot Latency: ${latency}ms`)
      .setTimestamp();

    replyMessage.edit({ embeds: [pingEmbed] });
  }
}
