const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Shutdown the bot.'),
  async execute(interaction, client) {
    if(interaction.user.id != process.env.OWNER_ID) return await interaction.reply({ content: "This command is only for my developers!" })
      else {
        const embed = new EmbedBuilder()
        .setColor('Random')
        .setDescription('The bot is stopped! Bot now offline.')

        await interaction.reply({ content: "Stopping bot..." });
        await client.user.setStatus('invisible');

        setTimeout(async () => {
          await interaction.reply({ content: "", embeds: [embed] });
          process.exit();
        }, 2000)
      }
  }
}
